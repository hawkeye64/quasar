import fs from 'node:fs'
import fse from 'fs-extra'
import path from 'node:path'

const baseFolder = path.resolve(import.meta.dirname, '../exports')
const extensionList = [
  { prop: 'types', ext: '.d.ts' },
  { prop: 'default', ext: '.js' }
]

/**
 * Reads directories in the base folder, skipping specified folders.
 * @param {string} folderPath - The path of the base folder.
 * @returns {Promise<string[]>} - List of folder names.
 */
async function readFolders(folderPath) {
  try {
    const entries = await fs.promises.readdir(folderPath, {
      withFileTypes: true
    })
    return entries
      .filter(entry => entry.isDirectory() && !entry.name.startsWith('.'))
      .map(entry => entry.name)
  } catch (err) {
    throw new Error(`Error reading directory: ${err.message}`, { cause: err })
  }
}

/**
 * Generates the exports object for the package.json file.
 * @param {string[]} folders - List of folder names.
 * @returns {object} - Exports configuration.
 */
function generateExports(folders) {
  const exports = {
    '.': {
      types: './index.d.ts',
      default: './index.js'
    },
    './package.json': './package.json'
  }

  for (const folder of folders) {
    if (folder === 'animate') {
      exports['./animate/animate-list.common'] = {
        types: './exports/animate/animate-list.d.ts',
        default: './exports/animate/animate-list.js'
      }
    } else {
      const exportDefinition = extensionList.reduce((acc, { prop, ext }) => {
        const filePath = path.join(baseFolder, folder, `index${ext}`)
        if (fs.existsSync(filePath)) {
          acc[prop] = `./exports/${folder}/index${ext}`
        }
        return acc
      }, {})

      if (Object.keys(exportDefinition).length !== 0) {
        exports[`./${folder}`] = exportDefinition
      }
    }
  }

  exports['./*'] = './exports/*'

  return exports
}

/**
 * Updates the package.json file with the new exports configuration.
 * @param {object} exports - Exports configuration.
 */
async function updatePackageJson(exports) {
  const packageJsonPath = path.join(import.meta.dirname, '../package.json')

  try {
    const packageJson = await fse.readJson(packageJsonPath)
    packageJson.exports = exports
    await fse.writeJson(packageJsonPath, packageJson, { spaces: 2 })
  } catch (err) {
    throw new Error(`Error updating package.json: ${err.message}`, {
      cause: err
    })
  }
}

// Main execution
try {
  const folders = await readFolders(baseFolder)
  const exports = generateExports(folders)
  await updatePackageJson(exports)
  console.log('package.json updated successfully!')
} catch (err) {
  console.error(err.message)
}
