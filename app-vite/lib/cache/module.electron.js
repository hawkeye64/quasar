import { getPackage } from '../utils/get-package.js'
import { fatal } from '../utils/logger.js'

const bundlerMap = {
  packager: {
    pkg: '@electron/packager',
    version: '20.0.0'
  },

  builder: {
    pkg: 'electron-builder',
    version: '26.0.12'
  }
}

function isValidName(bundlerName) {
  return ['packager', 'builder'].includes(bundlerName)
}

// returns a Promise!
function installBundler(bundlerName, nodePackager, appPaths) {
  const bundler = bundlerMap[bundlerName]

  return nodePackager.installPackage(`${bundler.pkg}@^${bundler.version}`, {
    cwd: appPaths.electronDir,
    isDevDependency: true
  })
}

function hasPackage(pkgName, modePkg) {
  return (
    ((modePkg.devDependencies && modePkg.devDependencies[pkgName]) ||
      (modePkg.dependencies && modePkg.dependencies[pkgName])) !== void 0
  )
}

export async function createInstance({
  appPaths,
  pkg: { electronPkg },
  cacheProxy
}) {
  const nodePackager = await cacheProxy.getModule('nodePackager')

  function bundlerIsInstalled(bundlerName) {
    const bundler = bundlerMap[bundlerName]
    return hasPackage(bundler.pkg, electronPkg)
  }

  async function ensureInstall(bundlerName) {
    if (!isValidName(bundlerName)) {
      fatal(`Unknown bundler "${bundlerName}" for Electron`)
    }

    if (!bundlerIsInstalled(bundlerName)) {
      await installBundler(bundlerName, nodePackager, appPaths)
    }
  }

  function getDefaultName() {
    if (bundlerIsInstalled('packager')) {
      return 'packager'
    }

    if (bundlerIsInstalled('builder')) {
      return 'builder'
    }

    return 'packager'
  }

  // Returns a Promise which resolves with the required bundler package.
  // May return "{ packager }" (@electron/packager v19+) or
  // or directly the package (electron-builder);
  function getBundler(bundlerName) {
    const bundler = bundlerMap[bundlerName]
    return getPackage(bundler.pkg, appPaths.electronDir)
  }

  return {
    bundlerIsInstalled,
    ensureInstall,
    getDefaultName,
    getBundler
  }
}
