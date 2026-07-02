import { existsSync } from 'node:fs'
import { resolveDir } from '../../utils/app-paths.js'

const dir = existsSync(resolveDir('src-electron/electron-assets/icons'))
  ? 'electron-assets/icons' // q/app-vite v3+
  : existsSync(resolveDir('src-electron/icons'))
    ? 'icons' // q/app-vite v2 or q/app-webpack v4
    : 'electron-assets' // fallback to q/app-webpack v3 specs

export default [
  {
    // macos (embedded icons)
    generator: 'icns',
    name: 'icon.icns',
    folder: `src-electron/${dir}`
  },

  {
    // windows (embedded icon)
    generator: 'ico',
    name: 'icon.ico',
    folder: `src-electron/${dir}`
  },

  {
    // tray icon (all platforms)
    generator: 'png',
    name: 'icon.png',
    folder: `src-electron/${dir}`,
    sizes: [512]
  }
]
