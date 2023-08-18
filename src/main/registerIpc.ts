import { BrowserWindow, app, ipcMain, dialog } from 'electron';
import { readdir, stat, readFile } from 'fs/promises';
import { dirname, parse } from 'path';
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
async function startScanDir(win, type, filePath) {
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
    }, 250);
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
        startScanDir(win, type, filePath);
    });
    ipcMain.on('dir:scan:cancel', async (_, type: listType) => {
        scan[type]?.cancel();
    });
    ipcMain.on('dir:getTrackList', async (event, filePath) => {
        const win = BrowserWindow.fromWebContents(event.sender);

        const dir = dirname(filePath);
        const fileName = parse(filePath).name;

        const list = await readdir(dir);
        for (const [index, file] of list.entries()) {
            if (index > 200) return;
            if (!file) continue;
            if (!file.endsWith('.txt')) continue;
            const path = resolve(dir, fileName + '.txt');
            console.log('looking for tracklist:', path);
            if (file === fileName + '.txt') {
                const data = await readFile(path, 'utf-8');
                const arr = data.split(/\r?\n/);

                let parsedLines = {};
                for (const line of arr) {
                    const split = line.split('//');

                    // get time in seconds
                    const timeParse = split[0].trim().split(':');
                    const seconds =
                        parseInt(timeParse[0]) * 60 + parseInt(timeParse[1]);
                    parsedLines = {
                        ...parsedLines,
                        [seconds]: split[1].trim()
                    };
                }
                console.log('got tracklist!');
                win?.webContents.send('dir:getTrackList', {
                    type: 'ok',
                    data: parsedLines
                });
                return;
            }
        }
        console.log('no tracklist!');

        win?.webContents.send('dir:getTrackList', { type: 'error' });
    });
    ipcMain.on('dir:getRibbitText', async (event, filePath) => {
        const win = BrowserWindow.fromWebContents(event.sender);

        const dir = filePath;
        const fileName = 'Ribbit-Text';

        const list = await readdir(dir);
        for (const [index, file] of list.entries()) {
            if (index > 200) return;
            if (!file) continue;
            if (!file.endsWith('.txt')) continue;
            const path = resolve(dir, fileName + '.txt');
            console.log('looking for tracklist:', path);
            if (file === fileName + '.txt') {
                const data = await readFile(path, 'utf-8');
                const arr = data.split(/\r?\n/);

                const arr2 = shuffleArray(arr);
                console.log('got ribbitlist!');

                win?.webContents.send('dir:getRibbitText', {
                    type: 'ok',
                    data: arr2
                });
                return;
            }
        }
        console.log('no ribbitlist!');

        win?.webContents.send('dir:getRibbitText', { type: 'error' });
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
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
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
    startScanDir(win, type, filePath);
}
function scanDir(win: BrowserWindow | null, type: listType) {
    let isCancelled = false;
    let directory = '';
    async function walk(dir: string) {
        directory = dir;
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
                dir: directory,
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
            dir: directory,
            done: true
        });
    }

    return {
        start: walk,
        cancel: cancelWalk
    };
}
