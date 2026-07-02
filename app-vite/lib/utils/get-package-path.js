import { createRequire } from 'node:module'
import { existsSync } from 'node:fs'
import { join } from 'node:path'
import { resolvePathSync } from 'mlly'

/**
 * Eventually replace by the native import.meta.resolve() method
 * when it is out of "experimental" status with no node flags required.
 */
const require = createRequire(import.meta.url)

/**
 * Get the resolved path of a host package.
 */
export function getPackagePath(pkgName, dir) {
  if (dir === void 0) {
    console.error('getPackagePath() -> dir param is required')
    process.exit(1)
  }

  try {
    return resolvePathSync(pkgName, { url: dir })
  } catch {
    /* Do nothing, let the next method try as well */
  }

  /**
   * Some packages have "exports" field in their package.json,
   * but they don't mention the required file in it, so we try to
   * check if the file/folder exists for ourselves.
   */
  const packagePath = join(dir, 'node_modules', pkgName)
  if (existsSync(packagePath)) return packagePath

  try {
    /**
     * Final try, by using legacy method:
     */
    return require.resolve(pkgName, {
      paths: [dir]
    })
  } catch {
    /* Else... do and return nothing */
  }
}
