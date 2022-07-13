const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
  dataGet: (callback) => ipcRenderer.invoke('data:get',callback),
  dataSet: (data) => ipcRenderer.send('data:set',data),
  handleSaveSetting: (callback) => ipcRenderer.on( 'save-settings', callback),
  handleLastPlayed: (callback) => ipcRenderer.on( 'last-played', callback),
  handleThemeChange: (callback) => ipcRenderer.on( 'theme-change', callback),
  handleSortChange: (callback) => ipcRenderer.on( 'sort-change', callback),
  handleSelectedFiles: (callback) => ipcRenderer.on( 'selected-files', callback)



})