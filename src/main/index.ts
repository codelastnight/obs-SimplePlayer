import {
    app,
    BrowserWindow,
    dialog,
    Menu,
    ipcMain,
} from 'electron';
const { autoUpdater } = require("electron-updater")
import { electronApp, optimizer, is } from '@electron-toolkit/utils'

import * as path from 'path'
import * as fs from 'fs'
const openAboutWindow = require('about-window').default;
const isDev = require('electron-is-dev');
//const storage = require('electron-storage');
const Store = require('electron-store');
const store = new Store();

const mm = require('music-metadata');
const chokidar = require('chokidar');

let files = null;

// launch extra express server
import { fork } from 'child_process';
const child = fork(path.resolve(__dirname, 'server.js'), ['server'])
let status = 0;
let watcher;

if (isDev) {
    // require('electron-reload')(__dirname, {
    //     electron: require(`./node_modules/electron`)
    // });
} else {
    // const server = 'http://hazel-duskplayer.vercel.app/';
    // const url = `${server}/update/${process.platform}/${app.getVersion()}`;

    // autoUpdater.setFeedURL({ url });
}

let win;

// const logging = (info) => {
//     win.webContents.send('logging',info)
//     return;
// }

function createMenu(theme, sort) {
    function handleClick(menuItem, browserWindow, event) {
        win.webContents.send('theme-change', {
            theme: menuItem.label.toLowerCase()
        });
        store.set('theme', { theme: menuItem.label.toLowerCase() })
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

    var theme = {
        label: 'Theme',
        submenu: [
            {
                label: 'Light',
                type: 'radio',
                click: handleClick,
                checked: theme.light
            },
            {
                label: 'Dark',
                type: 'radio',
                click: handleClick,
                checked: theme.dark
            },
            {
                label: 'Disco',
                type: 'radio',
                click: handleClick,
                checked: theme.disco
            }
        ]
    };

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

        createMenuMac(openFolder, theme, info, sort);
    } else {
        createMenuOther(openFolder, theme, info, sort);
    }
}
function createWindow() {
    // Create the browser window.
    win = new BrowserWindow({
        width: 1000,
        height: 620,
        icon: __dirname + '/dusk.png',
        webPreferences: {
            //nodeIntegration: true,
            nodeIntegrationInWorker: true,
            preload: path.join(__dirname, '../preload/index.js'),
            enableRemoteModule: true,
            backgroundThrottling: false,
            webviewTag: true
        }
    });

    var light = false;
    var dark = false;
    var disco = false;

    var asc = true;
    var dec = false;

    var songName = false;
    var artistName = false;
    var dateAdded = false;

    var theme = { light, dark, disco };
    var sort = { order: { asc, dec }, by: { songName, artistName, dateAdded } };

    // storage.isPathExists('theme', function (hasKey) {
    //     if (hasKey) {
    //         storage.get('theme', function (error, data) {
    //             if (error) throw error;

    //             if (data.theme == 'light') theme.light = true;
    //             else if (data.theme == 'disco') theme.disco = true;
    //             else theme.dark = true;

    //             createMenu(theme, sort);
    //         });
    //     } else {
    //         dark = true;
    //         createMenu(theme, sort);
    //     }
    // });
    dark = true;
    createMenu(theme, sort);
    // and load the index.html of the app.
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

        // storage.isPathExists('path', function (isDoes) {
        //     if (isDoes) {
        //         storage.get('path', function (error, data) {
        //             if (error) throw (error)
        //             else {
        //                logging(data)
        //                 scanDir(data)
        //             }

        //         });
        //     }
        // });

    });

    // win.loadURL(
    //     url.format({
    //         pathname:,
    //         protocol: 'file:',
    //         slashes: true
    //     })
    // );
    ipcMain.on('openDir', (e) => {
        openFolderDialog()
    })
    ipcMain.on('data:set', (e, data) => {
        let combine = {}
        const combinedData = store.get(data.key)
        if (combinedData == undefined) return;

        combine = combinedData;

        store.set(data.key, { ...combine, ...data.value })
        // storage.isPathExists(data.key, function (isDoes) {
        //     if (isDoes) {
        //         storage.get(key, function (error, combinedata) {
        //             if (error) throw (error)
        //             else combine = combinedata
        //         });
        //     }
        // });
        // storage.set(
        //     data.key,
        //     { ...combine, ...data.value },
        //     function (error) {
        //         if (error) return false;
        //     }
        // );
        return true
    })
    ipcMain.handle('data:get', async (e, key) => {
        const data = store.get(key)
        if (data == undefined) return { type: 'unsaved', data: null };

        return { type: 'ok', data: data };

        // storage.isPathExists(key, function (isDoes) {
        //     if (isDoes) {
        //         storage.get(key, function (error, data) {

        //             if (error) return { type: 'error', data: null }
        //             else return { type: 'ok', data: data }
        //         });
        //     }


        // });
        // return { type: 'unsaved', data: null }
    });


    ipcMain.on('scanDir', (e, path) => {
        scanDir(path);
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
    // Open the DevTools.if (isDev)
    win.webContents.openDevTools();
}

ipcMain.on('closed', () => {
    status = 1;
    mainWindow = null;
    if (process.platform !== 'darwin') {
        app.quit();
    }
});


app.whenReady().then(() => {
    createWindow();
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
    await dialog.showOpenDialog(win, { properties: ['openDirectory'] }).then(
        (result) => {
            const filePath = result.filePaths[0];
            if (filePath) {
                store.set('path', filePath);

                // storage.set('path',  filePath , function (error) {
                //     if (error) throw error;
                // });

                scanDir(filePath);
            }
        },
        (error) => {
            throw error;
        }
    );
}



var walkSync = function (dir, filelist = []) {
    files = fs.readdirSync(dir);
    filelist = filelist || [];
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
async function parseFiles(audioFiles) {
    var titles = [];

    // loading = true;

    for (const audioFile of audioFiles) {
        // await will ensure the metadata parsing is completed before we move on to the next file
        const metadata = await mm.parseFile(audioFile, { skipCovers: true })
            .catch((err) => { console.error(err); return [] });
        const stats = fs.statSync(audioFile);
        var data = {};
        var title = metadata.common.title;
        var artist = metadata.common.artist;
        if (title) data.title = metadata.common.title;
        else data.title = audioFile.split(path.sep).slice(-1)[0];
        if (artist) data.artist = metadata.common.artist;
        else data.artist = '';
        data.modDate = stats.mtime;

        titles.push(data);
    }
    //loading = false;

    return titles;
}
async function parseFile(audioFile) {
    // await will ensure the metadata parsing is completed before we move on to the next file
    const metadata = await mm.parseFile(audioFile, { skipCovers: true })
        .catch((err) => { console.error(err); return [] });
    const stats = fs.statSync(audioFile);
    var data = {};
    var title = metadata.common.title;
    var artist = metadata.common.artist;
    if (title) data.title = metadata.common.title;
    else data.title = audioFile.split(path.sep).slice(-1)[0];
    if (artist) data.artist = metadata.common.artist;
    else data.artist = '';
    data.modDate = stats.mtime;
    return data;
}
async function scanDir(filePath) {
    if (!filePath || filePath[0] == 'undefined') return;
    watcher = chokidar.watch(filePath, {
        ignored: /[\/\\]\./,
        persistent: true
    });

    var arr = walkSync(filePath);
    var arg = {};
    var names = await parseFiles(arr);

    arg.files = arr;
    arg.path = filePath;
    arg.names = names;

    win.webContents.send('selected-files', arg);

    watcher
        .on('add', (path) => win.webContents.send('playlist:add', path))
        .on('unlink', (path) => win.webContents.send('playlist:remove', path));

}

function createMenuOther(openFolder, theme, info, sort) {
    var menu = Menu.buildFromTemplate([openFolder, sort, info]);
    Menu.setApplicationMenu(menu);
}

function createMenuMac(openFolder, theme, sort, info) {
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
        theme,
        sort,
        info
    ]);
    Menu.setApplicationMenu(menu);
}

