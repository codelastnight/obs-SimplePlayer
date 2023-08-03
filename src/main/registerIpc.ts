import { BrowserWindow, app, ipcMain, dialog } from 'electron';
import { readdir, stat } from 'fs/promises';

import type { Song } from './parseMetadata';
import Store from 'electron-store';
import { parseMetadata } from './parseMetadata';
import { resolve } from 'path';
import { autoUpdater } from 'electron-updater';

const store = new Store();
let status = 0;

interface scanobj {
    standby: ReturnType<typeof scanDir> | null;
    track: ReturnType<typeof scanDir> | null;
}

let scan: scanobj = {
    standby: null,
    track: null
};
export function getStatus() {
    return status;
}
export function registerIpc() {
    // data store ipc

    ipcMain.on('data:set', (_, data) => {
        const combinedData = store.get(data.key);
        if (!combinedData) {
            store.set(data.key, data.value);
        } else {
            store.set(data.key, { ...combinedData, ...data.value });
        }

        return true;
    });
    ipcMain.handle('data:get', async (_, key) => {
        const data = store.get(key);
        if (data == undefined) return { type: 'unsaved', data: null };

        return { type: 'ok', data: data };
    });
    ipcMain.handle('data:about', async (_) => {
        const version = app.getVersion();
        return { version: version };
    });
    // directory ipc
    ipcMain.on('dir:open', (event, type) => {
        const win = BrowserWindow.fromWebContents(event.sender);

        openFolderDialog(win, type);
    });

    ipcMain.on('dir:scan', async (event, type, filePath) => {
        const win = BrowserWindow.fromWebContents(event.sender);

        if (!win) return;
        if (scan[type]) scan[type].cancel();
        win.webContents.send('files:selected', {
            type,
            dir: filePath,
            loading: true
        });

        // attempt to prevent race conditions lol
        setTimeout(async function () {
            store.set(type, filePath);
            scan[type] = scanDir(win, type);
            await scan[type].start(filePath);
            win?.webContents.send('files:selected', {
                type,
                dir: filePath,
                loading: false
            });
            console.log('scan directory completed:', type);

            //watchDir(filePath);
        }, 50);
    });
    ipcMain.on('dir:scan:cancel', async (_, type: listType) => {
        scan[type]?.cancel();
    });

    ipcMain.on('data:checkUpdate', () => {
        autoUpdater.checkForUpdatesAndNotify();
    });

    ipcMain.on('closed', () => {
        status = 1;
        for (const scanner of Object.values(scan)) {
            if (scanner) scanner.cancel();
        }

        if (process.platform !== 'darwin') {
            app.quit();
        }
    });
}

export type listType = 'standby' | 'track' | 'none';

export interface fileData {
    path: string;
    songList: Song[];
}
function checkIfAudioFile(file: string) {
    return (
        file.endsWith('.mp3') ||
        file.endsWith('.m4a') ||
        file.endsWith('.wav') ||
        file.endsWith('.aac') ||
        file.endsWith('.ogg') ||
        file.endsWith('.webm') ||
        file.endsWith('.opus')
    );
}

export interface playlistAdd {}
async function openFolderDialog(win: BrowserWindow | null, type: listType) {
    if (!win) return;
    const result = await dialog
        .showOpenDialog(win, { properties: ['openDirectory'] })
        .catch((error) => {
            throw error;
        });
    if (result.canceled) return;
    const filePath = result.filePaths[0];
    if (!filePath || filePath[0] === 'undefined') return;
    win.webContents.send('files:selected', {
        type,
        dir: filePath,
        done: false
    });
    // attempt to prevent race conditions lol
    setTimeout(async function () {
        store.set(type, filePath);
        if (scan[type]) scan[type]?.cancel(); // stop existing search
        scan[type] = scanDir(win, type);
        await scan[type]?.start(filePath);
        win?.webContents.send('files:selected', {
            type,
            filePath,
            done: true
        });

        //watchDir(filePath);
    }, 500);
}
function scanDir(win: BrowserWindow | null, type: listType) {
    let isCancelled = false;

    async function walk(dir: string) {
        if (isCancelled) return;
        console.log('scan directory started:', type);

        try {
            const list = await readdir(dir);
            if (!list) return;
            for (const [index, file] of list.entries()) {
                if (index > 200) return;
                if (!file) continue;
                const path = resolve(dir, file);
                const fileStat = await stat(path).catch((e) => {
                    console.log(e);
                });
                if (fileStat && fileStat.isDirectory()) {
                    await walk(path);
                } else if (checkIfAudioFile(file)) {
                    ///
                    const metadata = await parseMetadata(path);

                    win?.webContents.send('playlist:add', {
                        type,
                        metadata
                    });
                }
            }
        } catch (e) {
            console.error(e);
            isCancelled = true;
            win?.webContents.send('files:selected', {
                type,
                dir: '',
                done: true
            });
            return;
        }
    }
    // cancel the recursion
    function cancelWalk() {
        isCancelled = true;
        console.log('scan directory cancelled:', type);
        win?.webContents.send('files:selected', {
            type,
            dir: '',
            done: true
        });
    }

    return {
        start: walk,
        cancel: cancelWalk
    };
}
