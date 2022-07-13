const { contextBridge, ipcRenderer } = require('electron')
const fs = require('fs');
const mm = require('music-metadata');
const path = require('path');

contextBridge.exposeInMainWorld('electronAPI', {
    dataGet: (callback) => ipcRenderer.invoke('data:get',callback),
    dataSet: (data) => ipcRenderer.send('data:set',data),
    handleSaveSetting: (callback) => ipcRenderer.on( 'save-settings', callback),
    handleLastPlayed: (callback) => ipcRenderer.on( 'last-played', callback),
    handleThemeChange: (callback) => ipcRenderer.on( 'theme-change', callback),
    handleSortChange: (callback) => ipcRenderer.on( 'sort-change', callback),
    handleSelectedFiles: (callback) => ipcRenderer.on( 'selected-files', callback),
    handlePlaylistAdd: (callback) => ipcRenderer.on( 'playlist:add', callback),
    handlePlaylistRemove: (callback) => ipcRenderer.on( 'playlist:remove', callback),
    handleClosed: () => ipcRenderer.send( 'closed'),
    handleScanDir: (path) => ipcRenderer.send( 'scanDir', path),
    openDir: () => ipcRenderer.send( 'openDir'),

    fsStatSync: (path) => fs.statSync(path),
    mmParseFile: (filePath, options) => mm.parseFile(filePath,options),
    pathSep: () =>  path.sep
})