import {
    app,
    BrowserWindow,
    utilityProcess,
    MessageChannelMain,
    shell,
    UtilityProcess
} from 'electron';
import { autoUpdater } from 'electron-updater';
import { electronApp, optimizer, is } from '@electron-toolkit/utils';

import { join, resolve } from 'path';

import { getStatus, registerIpc } from './registerIpc';

/// launch another server on separate process
let child: UtilityProcess;
function launchServer() {
    const { port1, port2 } = new MessageChannelMain();
    // launch extra express server
    child = utilityProcess.fork(resolve(__dirname, 'server.js'), ['server']);
    child.postMessage({ message: 'launch server' }, [port1]);
    port1.on('message', (e) => {
        console.log(e.data);
    });
}

export interface updateData {
    type: 'available' | 'error' | 'downloaded' | 'unavailable' | 'none';
}
autoUpdater
    .on('update-available', () => {
        win?.webContents.send('data:update', {
            type: 'available'
        } as updateData);
    })
    .on('error', () => {
        win?.webContents.send('data:update', { type: 'error' } as updateData);
    })
    .on('update-downloaded', () => {
        win?.webContents.send('data:update', {
            type: 'downloaded'
        } as updateData);
    })
    .on('update-not-available', () => {
        win?.webContents.send('data:update', {
            type: 'unavailable'
        } as updateData);
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

    win.webContents.setWindowOpenHandler(({ url }) => {
        shell.openExternal(url);
        return { action: 'deny' };
    });
    // Emitted when the window is closed.

    win.on('closed', () => {});
}

app.whenReady().then(() => {
    electronApp.setAppUserModelId('arts-and-crafts');
    createWindow();
    registerIpc();
    optimizer.registerFramelessWindowIpc();
    autoUpdater.checkForUpdatesAndNotify();
});

app.on('activate', () => {
    if (win === null) {
        createWindow();
    }
});

app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window);
});
// Quit when all windows are closed.
app.on('window-all-closed', () => {
    child.kill();
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

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

// //check for changes in folder
// let watcher;

// async function watchDir(filePath) {
//     watcher = watch(filePath, {
//         ignored: /[\/\\]\./,
//         persistent: true
//     });

//     watcher
//         .on('add', (path: string) => {
//             if (!checkIfAudioFile(path)) return;
//             parseMetadata(path).then(
//                 (data) => win?.webContents.send('playlist:add', data)
//             );
//         })
//         .on('unlink', (path: string) => {
//             win?.webContents.send('playlist:remove', path);
//         });
// }
