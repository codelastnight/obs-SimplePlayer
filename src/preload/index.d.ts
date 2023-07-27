import { ElectronAPI } from '@electron-toolkit/preload'
import type { Api } from './index.ts'
declare global {
    interface Window {
        electron: ElectronAPI
        api: Api
    }
}