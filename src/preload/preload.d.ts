import { ElectronAPI } from '@electron-toolkit/preload'
import { UpgradeChannel } from '@shared/config/constant'

/** you don't need to declare this in your code, it's automatically generated */
declare global {
  interface Window {
    electron: ElectronAPI
    api: WindowApiType
  }

  interface WindowApiType {
    setLaunchOnBoot(isLaunchOnBoot: boolean): unknown
    setLaunchToTray(isLaunchToTray: boolean): unknown
    setTray(isShowTray: boolean): unknown
    setTrayOnClose(isTrayOnClose: boolean): unknown
    setAutoUpdate(isAutoUpdate: boolean): unknown
    setTestPlan(isTestPlan: boolean): unknown
    setTestChannel(channel: UpgradeChannel): unknown
    setDisableHardwareAcceleration(disableHardwareAcceleration: boolean): unknown
    config: any
    setHttpApiServerEnabled: (enabled: boolean) => void
    setHttpApiServerPort: (port: number) => void
  }
}
