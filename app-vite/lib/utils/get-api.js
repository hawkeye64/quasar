import fs from 'node:fs'
import path from 'node:path'
import { createRequire } from 'node:module'

import { fatal } from './logger.js'
import { getPackage } from './get-package.js'

const require = createRequire(import.meta.url)

export async function getApi(item, ctx) {
  const {
    appPaths,
    appExt: { extensionList }
  } = ctx

  try {
    const api = await getPackage(
      `quasar/dist/api/${item}.json`,
      appPaths.appDir
    )
    if (api !== void 0) {
      return { api }
    }
  } catch {
    /* do nothing */
  }

  if (extensionList.length === 0) {
    fatal(`No API found for requested "${item}"`)
  }

  for (const ext of extensionList) {
    const hooks = await ext.run()

    if (hooks.describeApi === void 0 || hooks.describeApi[item] === void 0) {
      continue
    }

    let file
    const { callerPath, relativePath } = hooks.describeApi[item]

    if (relativePath.at(0) === '~') {
      try {
        file = relativePath.slice(1)
        file = require.resolve(file, {
          paths: [callerPath, appPaths.appDir]
        })
      } catch {
        ext.logger.fatal(
          `registerDescribeApi - there is no package "${file}" installed`
        )
      }
    } else {
      file = path.resolve(callerPath, relativePath)

      if (!fs.existsSync(file)) {
        ext.logger.fatal(`registerDescribeApi - there is no file at ${file}`)
      }
    }

    try {
      return {
        api: JSON.parse(fs.readFileSync(file, 'utf8')),
        supplier: ext.extId
      }
    } catch {
      ext.logger.fatal(`Malformed API file at ${file}`)
    }
  }
}
