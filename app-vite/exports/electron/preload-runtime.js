import { ipcRenderer } from 'electron'

export function resolveElectronAssetsPath(...args) {
  return ipcRenderer.sendSync(
    'quasar-electron:resolve-electron-assets',
    ...args
  )
}

export function resolvePublicPath(...args) {
  return ipcRenderer.sendSync('quasar-electron:resolve-public', ...args)
}

export const quasarRuntime = {
  electronAssetsDir: resolveElectronAssetsPath(),
  resolveElectronAssetsPath,

  publicDir: resolvePublicPath(),
  resolvePublicPath
}
