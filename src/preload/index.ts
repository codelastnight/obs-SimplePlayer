import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'
import { Song, parseMetadata } from '../main/parseMetadata';

import type { fileData, updateData } from '../main/index'
//const { contextBridge, ipcRenderer } = require('electron')
import { statSync } from 'fs';
import { sep } from 'path'
// Custom APIs for renderer
const api = {
  dataGet: (callback) => ipcRenderer.invoke('data:get', callback),
  dataSet: (data) => ipcRenderer.send('data:set', data),
  handleSaveSetting: (callback) => ipcRenderer.on('save-settings', callback),
  handleLastPlayed: (callback) => ipcRenderer.on('last-played', callback),
  handleSortChange: (callback) => ipcRenderer.on('sort-change', callback),
  onPlaylistChanged: (callback: (e, data:{dir,done}) => void) => ipcRenderer.on('files:selected', callback),
  onPlaylistAdd: (callback:(e,song:Song)=>void) => ipcRenderer.on('playlist:add', callback),
  onPlaylistRemoved: (callback) => ipcRenderer.on('playlist:remove', callback),
  handleClosed: () => ipcRenderer.send('closed'),
  handleScanDir: (path: string) => ipcRenderer.send('dir:scan', path),
  cancelScanDir: () => ipcRenderer.send('dir:scan:cancel'),
  openDir: () => ipcRenderer.send('dir:open'),
  logging: (callback) => ipcRenderer.on('logging', callback),
  fsStatSync: (path: string) => statSync(path),
  parseMetadata: (filePath: string) => parseMetadata(filePath),
  pathSep: () => sep,
  winClose: () => ipcRenderer.send('win:close'),
  winMinimize: () => ipcRenderer.send('win:min'),
  getAboutData: (callback) => ipcRenderer.invoke('data:about', callback),
  checkAppUpdate: () => ipcRenderer.send('data:checkUpdate'),
  onAppUpdate: (callback: (e, arg: updateData) => void) => ipcRenderer.on('data:update', callback)
}

export type Api = typeof api;

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api
}

