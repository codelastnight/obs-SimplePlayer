import { ElectronAPI } from '@electron-toolkit/preload'
import type { api } from './index.ts'
declare global {
    interface Window {
        electron: ElectronAPI
        api: api
    }
}