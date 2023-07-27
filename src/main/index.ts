import {
    app,
    BrowserWindow,
    dialog,
    Menu,
    ipcMain,
    protocol
} from 'electron';
import { autoUpdater } from "electron-updater"
import { electronApp, optimizer, is } from '@electron-toolkit/utils'

import * as path from 'path'
import * as fs from 'fs'
import { parseMetadataFiles } from './parseMetadata'
const openAboutWindow = require('about-window').default;
//const storage = require('electron-storage');
import Store from 'electron-store';
const store = new Store();

import { watch } from 'chokidar';

let files;

// launch extra express server
import { fork } from 'child_process';
const child = fork(path.resolve(__dirname, 'server.js'), ['server'])
let status = 0;

if (is.dev) {
    // require('electron-reload')(__dirname, {
    //     electron: require(`./node_modules/electron`)
    // });
} else {
    // const server = 'http://hazel-duskplayer.vercel.app/';
    // const url = `${server}/update/${process.platform}/${app.getVersion()}`;

    // autoUpdater.setFeedURL({ url });
}



// const logging = (info) => {
//     win.webContents.send('logging',info)
//     return;
// }

function createMenu(sort) {
    function handleClick(menuItem, browserWindow, event) {
        // win.webContents.send('theme-change', {
        //     theme: menuItem.label.toLowerCase()
        // });
        //store.set('theme', { theme: menuItem.label.toLowerCase() })
        // storage.set(
        //     'theme',
        //     { theme: menuItem.label.toLowerCase() },
        //     function (error) {
        //         if (error) throw error;
        //     }
        // );
    }

    function handleSort(menuItem, browserWindow, event) {
        var items = menuItem.menu.items;
        win.webContents.send('sort-change', { items: items });
    }

    /**
     * Because menu buttons on MacOS *require* at least one submenu,
     * store them in variables inorder to modify them if application is
     * running on Mac.
     */
    var openFolder = {
        label: 'Folders',
        accelerator: 'CommandOrControl+o',
        click: function () {
            openFolderDialog();
        }
    };

    var info = {
        label: 'Info',
        click: function () {
            win.webContents.openDevTools();
            openAboutWindow({
                product_name: 'OBS simple player :)',
                homepage: 'https://github.com/codelastnight/obs-SimplePlayer',
                copyright: 'arts + crafts',
                description: 'i love frogs!!!!',
                license: 'MIT',
                icon_path: path.join(__dirname, 'logo.png')
            });
        }
    };

    // var theme = {
    //     label: 'Theme',
    //     submenu: [
    //         {
    //             label: 'Light',
    //             type: 'radio',
    //             click: handleClick,
    //             checked: theme.light
    //         },
    //         {
    //             label: 'Dark',
    //             type: 'radio',
    //             click: handleClick,
    //             checked: theme.dark
    //         },
    //         {
    //             label: 'Disco',
    //             type: 'radio',
    //             click: handleClick,
    //             checked: theme.disco
    //         }
    //     ]
    // };

    var sort = {
        label: 'Sort',
        submenu: [
            {
                label: 'Date added',
                type: 'radio',
                click: handleSort,
                checked: sort.by.dateAdded
            },
            {
                label: 'Song name',
                type: 'radio',
                click: handleSort,
                checked: sort.by.songName
            },
            {
                label: 'Artist name',
                type: 'radio',
                click: handleSort,
                checked: sort.by.artistName
            },
            {
                label: 'Default',
                type: 'radio',
                click: handleSort,
                checked: true
            },
            { type: 'separator' },
            {
                label: 'Ascending',
                type: 'radio',
                click: handleSort,
                checked: sort.order.asc
            },
            {
                label: 'Descending',
                type: 'radio',
                click: handleSort,
                checked: sort.order.dec
            }
        ]
    };

    if (process.platform === 'darwin') {
        openFolder = {
            label: 'Folders',
            submenu: [
                {
                    label: 'Open folder',
                    accelerator: 'CommandOrControl+o',
                    click: function () {
                        openFolderDialog();
                    }
                }
            ]
        };

        info = {
            label: 'Info',
            submenu: [
                {
                    label: 'Show info',

                    click: function () {
                        openAboutWindow({
                            product_name: 'OBS simple player :)',
                            homepage: 'https://github.com/codelastnight/obs-SimplePlayer',
                            copyright: 'arts + crafts',
                            icon_path: path.join(__dirname, 'logo.png')
                        });
                    }
                }
            ]
        };

        createMenuMac(openFolder, info, sort);
    } else {
        createMenuOther(openFolder, info, sort);
    }
}

let win: BrowserWindow | null;

function createWindow() {
    // Create the browser window.
    win = new BrowserWindow({
        width: 1000,
        height: 620,
        icon: __dirname + '/dusk.png',
        webPreferences: {
            nodeIntegration: true,
            nodeIntegrationInWorker: true,
            preload: path.join(__dirname, '../preload/index.js'),
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

    createMenu(sort);

    // for HMR from electron-vite
    if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
        win.loadURL(process.env['ELECTRON_RENDERER_URL'])
    } else {
        win.loadFile(path.join(__dirname, '../renderer/index.html'))
    }

    win.webContents.once('dom-ready', () => {
        const path = store.get('path');
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

    ipcMain.on('dir:open', (e) => {
        openFolderDialog()
    })
    ipcMain.on('dir:scan', (e, path) => {
        scanDir(path);
        watchDir(path)

    });
    win.on('close', (e) => {
        if (status == 0) {
            if (win) {
                e.preventDefault();
                win.webContents.send('save-settings');
            }
        }
    });

    // Emitted when the window is closed.
    win.on('closed', () => {
        win = null;
    });
    // Open the DevTools if (isDev)
    if (is.dev) win.webContents.openDevTools();
}

ipcMain.on('closed', () => {
    status = 1;
    win = null;

    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.whenReady().then(() => {
    createWindow();
    // protocol.registerFileProtocol('file', (request, callback) => {
    //     const pathname = decodeURI(request.url.replace('file:///', ''));
    //     callback(pathname);
    // });
});

// Quit when all windows are closed.
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (win === null) {
        createWindow();
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

function walkSync(dir: string, filelist: string[] = []) {
    files = fs.readdirSync(dir);
    files.forEach(function (file) {
        if (fs.statSync(path.join(dir, file)).isDirectory()) {
            filelist = walkSync(path.join(dir, file), filelist);
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
                filelist.push(path.join(dir, file));
            }
        }
    });
    return filelist;
};

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

let watcher;

async function watchDir(filePath) {
    watcher = watch(filePath, {
        ignored: /[\/\\]\./,
        persistent: true
    });

    watcher
        .on('add', (path: string) => { if (win) win.webContents.send('playlist:add', path) })
        .on('unlink', (path: string) => { if (win) win.webContents.send('playlist:remove', path) });
}

function createMenuOther(openFolder, info, sort) {
    var menu = Menu.buildFromTemplate([openFolder, sort, info]);
    Menu.setApplicationMenu(menu);
}

function createMenuMac(openFolder, sort, info) {
    var menu = Menu.buildFromTemplate([
        {
            label: require('electron').app.getName(),
            submenu: [
                {
                    role: 'quit',
                    accelerator: 'Cmd+Q'
                }
            ]
        },
        openFolder,
        sort,
        info
    ]);
    Menu.setApplicationMenu(menu);
}

