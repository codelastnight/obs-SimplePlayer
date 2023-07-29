import {
    app,
    BrowserWindow,
    dialog,
    ipcMain,
    utilityProcess,
    MessageChannelMain,
    shell
} from 'electron';
import { autoUpdater } from "electron-updater"
import { electronApp, optimizer, is } from '@electron-toolkit/utils'

import {join,resolve} from 'path'
import {readdirSync, statSync} from 'fs'
import { parseMetadataFiles } from './parseMetadata'
import { watch } from 'chokidar';
import Store from 'electron-store';

const store = new Store();

let status = 0;
/// launch another server on separate process
let child;
function launchServer() {
    const { port1, port2 } = new MessageChannelMain()
    // launch extra express server
    child = utilityProcess.fork(resolve(__dirname, 'server.js'), ['server'])
    child.postMessage({ message: 'launch server' }, [port1])
    port1.on('message', (e) => {
        console.log(e.data)
    })
}
/// auto update functions
function checkForUpdate() {
    autoUpdater.logger = require("electron-log")
    autoUpdater.checkForUpdatesAndNotify();

}
export interface updateData {
    type: 'available' | 'error' | 'downloaded' | 'unavailable' | 'none'
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

    var asc = true;
    var dec = false;

    var songName = false;
    var artistName = false;
    var dateAdded = false;


    var sort = { order: { asc, dec }, by: { songName, artistName, dateAdded } };


    // for HMR from electron-vite
    if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
        win.loadURL(process.env['ELECTRON_RENDERER_URL'])
    } else {
        win.loadFile(join(__dirname, '../renderer/index.html'))
    }

    win.webContents.once('dom-ready', () => {
        const path = store.get('path');

        launchServer();

        return; // temp
        if (path === undefined) return;
        //  logging(path)
        scanDir(path)
    });

    ipcMain.on('data:set', (e, data) => {
        let combine = {}
        const combinedData = store.get(data.key)
        if (combinedData == undefined) return false;

        combine = combinedData;

        store.set(data.key, { ...combine, ...data.value })

        return true
    })
    ipcMain.handle('data:get', async (e, key) => {
        const data = store.get(key)
        if (data == undefined) return { type: 'unsaved', data: null };

        return { type: 'ok', data: data };


    });
    ipcMain.handle('data:about', async (e, key) => {
        const version = app.getVersion()
        return { version: version };

    });
    ipcMain.on('dir:open', (e) => {
        openFolderDialog()
    })


    ipcMain.on('dir:scan', async (e, path) => {
        await scanDir(path);
        watchDir(path)

    });
    ipcMain.on('win:close', (e) => {
        win?.close()
    })
    ipcMain.on('win:min', (e) => {
        win?.minimize()
    })
    ipcMain.on('data:checkUpdate', (e) => {
        checkForUpdate()
    })
    win.on('close', (e) => {
        if (status === 0) {
            if (win) {
                e.preventDefault();
                win.webContents.send('save-settings');
            }
            child.kill()
        }
    });
    win?.webContents.setWindowOpenHandler(({ url }) => {
        shell.openExternal(url);
        return { action: 'deny' };
    });
    // Emitted when the window is closed.
    win.on('closed', () => {
        win = null;
        const a = child.kill()
        console.log(a)
    });
    // Open the DevTools if (isDev)
}



app.whenReady().then(() => {
    electronApp.setAppUserModelId('com.artsandcrafts')
    createWindow();
    checkForUpdate();
    // protocol.registerFileProtocol('file', (request, callback) => {
    //     const pathname = decodeURI(request.url.replace('file:///', ''));
    //     callback(pathname);
    // });

});

app.on('activate', () => {
    if (win === null) {
        createWindow();
    }
});

app.on('browser-window-created', (_, window) => {
    console.log(is.dev)
    optimizer.watchWindowShortcuts(window)


})
// Quit when all windows are closed.
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

ipcMain.on('closed', () => {
    status = 1;
    win = null;

    if (process.platform !== 'darwin') {
        app.quit();
    }
});


async function openFolderDialog() {
    if (win === null) return;
    const result = await dialog.showOpenDialog(win, { properties: ['openDirectory'] }).catch((error) => { throw error })

    const filePath = result.filePaths[0];
    if (filePath) {
        store.set('path', filePath);

        await scanDir(filePath);
        watchDir(filePath)
    }
}
import type { Song } from './parseMetadata'

export interface fileData {
    path: string;
    songList: Song[]
}
async function scanDir(filePath) {
    if (!filePath || filePath[0] === 'undefined' || !win) return;


    const arr = walkSync(filePath);
    const names = await parseMetadataFiles(arr);
    const arg = {

        path: filePath,
        songList: names
    }
    win.webContents.send('files:selected', arg);
}

function walkSync(dir: string, filelist: string[] = []) {
    const files = readdirSync(dir);
    files.forEach(function (file) {
        if (statSync(join(dir, file)).isDirectory()) {
            filelist = walkSync(join(dir, file), filelist);
        } else {
            if (
                file.endsWith('.mp3') ||
                file.endsWith('.m4a') ||
                file.endsWith('.webm') ||
                file.endsWith('.wav') ||
                file.endsWith('.aac') ||
                file.endsWith('.ogg') ||
                file.endsWith('.opus')
            ) {
                filelist.push(join(dir, file));
            }
        }
    });
    return filelist;
};



//check for changes in folder
let watcher;

async function watchDir(filePath) {
    watcher = watch(filePath, {
        ignored: /[\/\\]\./,
        persistent: true
    });

    watcher
        .on('add', (path: string) => { if (win) win.webContents.send('playlist:add', path) })
        .on('unlink', (path: string) => { if (win) win.webContents.send('playlist:remove', path) })

}



