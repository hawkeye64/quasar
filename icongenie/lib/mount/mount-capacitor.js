import { existsSync, readFileSync } from 'node:fs'

import { resolveDir } from '../utils/app-paths.js'
import { warn } from '../utils/logger.js'
import { spawnSync } from '../utils/spawn-sync.js'
import { createInstance } from '../utils/package-manager.js'

const srcCapacitorDir = resolveDir('src-capacitor')

async function installCapacitorAssets() {
  const pkgPath = resolveDir('src-capacitor/package.json')

  // malformed /src-capacitor...
  if (!existsSync(pkgPath)) return false

  const pkg = JSON.parse(readFileSync(pkgPath, 'utf8'))

  if (
    !pkg.devDependencies?.['@capacitor/assets'] &&
    !pkg.dependencies?.['@capacitor/assets']
  ) {
    const pm = createInstance(srcCapacitorDir)
    if (typeof pm === 'string') {
      warn(pm)
      return false
    }

    const success = await pm.installPackage('@capacitor/assets', {
      isDevDependency: true,
      allowBuilds: true
    })

    if (!success) {
      warn()
      warn('Failed to install @capacitor/assets. Please do it manually.')
      return false
    }
  }

  if (
    !pkg.dependencies?.['@capacitor/splash-screen'] &&
    !pkg.devDependencies?.['@capacitor/splash-screen']
  ) {
    const pm = createInstance(srcCapacitorDir)
    if (typeof pm === 'string') {
      warn(pm)
      return false
    }

    const success = await pm.installPackage('@capacitor/splash-screen')

    if (!success) {
      warn()
      warn('Failed to install @capacitor/splash-screen. Please do it manually.')
    }
  }

  return true
}

export async function mountCapacitor() {
  const hasInstalled = await installCapacitorAssets()
  if (!hasInstalled) return

  const success = await spawnSync('npx', ['@capacitor/assets', 'generate'], {
    cwd: srcCapacitorDir
  })

  if (!success) {
    warn()
    warn('Failed to run @capacitor/assets. Please do it manually.')
    console.log(' -> /src-capacitor: $ npx @capacitor/assets generate\n')
  }
}
