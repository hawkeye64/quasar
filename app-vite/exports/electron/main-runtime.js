import { join } from 'node:path'
import { app, ipcMain } from 'electron'

export function resolveElectronAssetsPath(...args) {
  const root = app.getAppPath()
  return join(
    root,
    import.meta.env.QUASAR_DEV
      ? '../../../src-electron/electron-assets'
      : 'electron-assets',
    ...args
  )
}

export function resolvePublicPath(...args) {
  const root = app.getAppPath()
  return join(
    root,
    import.meta.env.QUASAR_DEV ? '../../../public' : '.',
    ...args
  )
}

export const publicDir = resolvePublicPath()
export const electronAssetsDir = resolveElectronAssetsPath()

export function registerQuasarRuntime() {
  ipcMain.on('quasar-electron:resolve-electron-assets', (event, ...args) => {
    event.returnValue = resolveElectronAssetsPath(...args)
  })

  ipcMain.on('quasar-electron:resolve-public', (event, ...args) => {
    event.returnValue = resolvePublicPath(...args)
  })
}
