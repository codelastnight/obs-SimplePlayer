import {
    app,
    BrowserWindow,
    dialog,
    ipcMain,
    utilityProcess,
    MessageChannelMain,
    shell
} from 'electron';
import { autoUpdater } from 'electron-updater';
import { electronApp, optimizer, is } from '@electron-toolkit/utils';

import { join, resolve } from 'path';
import { readdir, stat } from 'fs/promises';

import { parseMetadata } from './parseMetadata';
import { watch } from 'chokidar';
import Store from 'electron-store';

const store = new Store();

let status = 0;
/// launch another server on separate process
let child;
function launchServer() {
    const { port1, port2 } = new MessageChannelMain();
    // launch extra express server
    child = utilityProcess.fork(resolve(__dirname, 'server.js'), ['server']);
    child.postMessage({ message: 'launch server' }, [port1]);
    port1.on('message', (e) => {
        console.log(e.data);
    });
}
/// auto update functions
function checkForUpdate() {
    autoUpdater.logger = require('electron-log');
    autoUpdater.checkForUpdatesAndNotify();
}
interface scanobj {
    standby: ReturnType<typeof scanDir> | null;
    track: ReturnType<typeof scanDir> | null;
}

let scan: scanobj = {
    standby: null,
    track: null
};

export interface updateData {
    type: 'available' | 'error' | 'downloaded' | 'unavailable' | 'none';
}
autoUpdater.on('update-available', () => {
    win?.webContents.send('data:update', { type: 'available' } as updateData);
});
autoUpdater.on('error', () => {
    win?.webContents.send('data:update', { type: 'error' } as updateData);
});
autoUpdater.on('update-downloaded', () => {
    win?.webContents.send('data:update', { type: 'downloaded' } as updateData);
});
autoUpdater.on('update-not-available', () => {
    win?.webContents.send('data:update', { type: 'unavailable' } as updateData);
});

/// init electron window
let win: BrowserWindow | null;

function createWindow() {
    // Create the browser window.
    win = new BrowserWindow({
        width: 1000,
        height: 620,
        icon: __dirname + '/dusk.png',
        titleBarStyle: 'hidden',
        webPreferences: {
            nodeIntegration: true,
            nodeIntegrationInWorker: true,
            preload: join(__dirname, '../preload/index.js'),
            // enableRemoteModule: true,
            backgroundThrottling: false,
            webviewTag: true,
            webSecurity: false // temporary. figure out custom protocal to secure app
        }
    });

    // for HMR from electron-vite
    if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
        win.loadURL(process.env['ELECTRON_RENDERER_URL']);
    } else {
        win.loadFile(join(__dirname, '../renderer/index.html'));
    }

    win.webContents.once('dom-ready', () => {
        launchServer();

        return; // temp
    });

    ipcMain.on('data:set', (_, data) => {
        const combinedData = store.get(data.key);
        if (!combinedData) {
            store.set(data.key, data.value);
        } else {
            store.set(data.key, { ...combinedData, ...data.value });
        }

        return true;
    });
    // data store ipc
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
    ipcMain.on('dir:open', (_, type) => {
        openFolderDialog(type);
    });

    ipcMain.on('dir:scan', async (_, type, filePath) => {
        if (!win) return;
        if (scan[type]) scan[type].cancel();
        win.webContents.send('files:selected', {
            type,
            dir: filePath,
            done: false
        });

        // attempt to prevent race conditions lol
        setTimeout(async function () {
            store.set(type, filePath);
            scan[type] = scanDir(type);
            await scan[type].start(filePath);
            win?.webContents.send('files:selected', {
                type,
                dir: filePath,
                done: true
            });
            console.log('scan directory completed:', type);

            //watchDir(filePath);
        }, 50);
    });
    ipcMain.on('dir:scan:cancel', async (_, type: listType) => {
        scan[type]?.cancel();
    });
    ipcMain.on('win:close', () => {
        win?.close();
    });
    ipcMain.on('win:min', () => {
        win?.minimize();
    });
    ipcMain.on('data:checkUpdate', () => {
        checkForUpdate();
    });
    win.on('close', (e) => {
        if (status === 0) {
            if (win) {
                e.preventDefault();
                win.webContents.send('save-settings');
            }
            child.kill();
        }
    });
    win?.webContents.setWindowOpenHandler(({ url }) => {
        shell.openExternal(url);
        return { action: 'deny' };
    });
    // Emitted when the window is closed.
    win.on('closed', () => {
        win = null;
        child.kill();
        for (const scanner of Object.values(scan)) {
            if (scanner) scanner.cancel();
        }
    });
    // Open the DevTools if (isDev)
}

app.whenReady().then(() => {
    electronApp.setAppUserModelId('artsandcrafts');
    createWindow();
    checkForUpdate();
});

app.on('activate', () => {
    if (win === null) {
        createWindow();
    }
});

app.on('browser-window-created', (_, window) => {
    console.log(is.dev);
    optimizer.watchWindowShortcuts(window);
});
// Quit when all windows are closed.
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

ipcMain.on('closed', () => {
    status = 1;
    win = null;
    for (const scanner of Object.values(scan)) {
        if (scanner) scanner.cancel();
    }
    child.kill();

    if (process.platform !== 'darwin') {
        app.quit();
    }
});
export type listType = 'standby' | 'track';
async function openFolderDialog(type: listType) {
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
        scan[type] = scanDir(type);
        await scan[type]?.start(filePath);
        win?.webContents.send('files:selected', { type, filePath, done: true });

        //watchDir(filePath);
    }, 500);
}
import type { Song } from './parseMetadata';

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
function scanDir(type: listType) {
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

                    win?.webContents.send('playlist:add', { type, metadata });
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
        win?.webContents.send('files:selected', { type, dir: '', done: true });
    }

    return {
        start: walk,
        cancel: cancelWalk
    };
}

// function walkSync(dir: string, filelist: string[] = []) {
//     const files = readdirSync(dir);
//     files.forEach(function (file) {
//         if (statSync(join(dir, file)).isDirectory()) {
//             filelist = walkSync(join(dir, file), filelist);
//         } else {
//             if (
//                 file.endsWith('.mp3') ||
//                 file.endsWith('.m4a') ||
//                 file.endsWith('.webm') ||
//                 file.endsWith('.wav') ||
//                 file.endsWith('.aac') ||
//                 file.endsWith('.ogg') ||
//                 file.endsWith('.opus')
//             ) {
//                 filelist.push(join(dir, file));
//             }
//         }
//     });
//     return filelist;
// };

//check for changes in folder
let watcher;

async function watchDir(filePath) {
    watcher = watch(filePath, {
        ignored: /[\/\\]\./,
        persistent: true
    });

    watcher
        .on('add', (path: string) => {
            if (!checkIfAudioFile(path)) return;
            parseMetadata(path).then(
                (data) => win?.webContents.send('playlist:add', data)
            );
        })
        .on('unlink', (path: string) => {
            win?.webContents.send('playlist:remove', path);
        });
}
