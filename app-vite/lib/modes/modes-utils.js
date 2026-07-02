import { existsSync } from 'node:fs'
import fse from 'fs-extra'

import { createPromptSession, info } from '../utils/logger.js'

/**
 * @param {import('../../types/app-paths').QuasarAppPaths} appPaths
 * @param {import('../../types/configuration/context').QuasarMode} modeName
 * @returns {boolean}
 */
export function isModeInstalled(appPaths, modeName) {
  return (
    modeName === 'spa' || // always installed
    existsSync(appPaths[`${modeName}Dir`])
  )
}

async function getScriptFormat(cacheProxy) {
  const hasTypescript = await cacheProxy.getModule('hasTypescript')
  return hasTypescript ? 'ts' : 'js'
}

/**
 * @param {import('../../types/configuration/context').QuasarMode} modeName
 * @param {Object} opts
 * @param {import('../../types/app-paths').QuasarAppPaths} opts.appPaths
 * @param {import('../../types/configuration/context').CacheProxy} opts.cacheProxy
 * @returns {Promise<boolean>} true if it had to create anything that requires re-install
 */
export async function ensureModePackageJsonAndWorkspace(
  modeName,
  { appPaths, cacheProxy }
) {
  // Nothing to do for SPA or Cordova mode
  if (modeName === 'spa' || modeName === 'cordova') return false

  let hadToCreateFiles = false

  const packageJsonPath = appPaths.resolve[modeName]('package.json')
  if (!existsSync(packageJsonPath)) {
    if (modeName === 'ssr') {
      const promptSession = await createPromptSession(
        '⚠️  SSR Mode is missing package.json...'
      )

      const { webserver } = await promptSession.prompt({
        webserver: () =>
          promptSession.select({
            message: 'What production webserver are you currently using?',
            options: [
              /**
               * Also update lib/ssr/ssr-installation.js options if you
               * change these here.
               */
              { value: 'hono', label: 'Hono' },
              { value: 'fastify', label: 'Fastify' },
              { value: 'express', label: 'Express' },
              { value: 'koa', label: 'Koa' }
            ]
          })
      })

      const subfolder =
        webserver === 'express' || webserver === 'koa'
          ? await getScriptFormat(cacheProxy)
          : 'common'

      fse.copySync(
        appPaths.resolve.cli(
          `templates/ssr/${webserver}/${subfolder}/package.json`
        ),
        packageJsonPath
      )

      promptSession.end('Created /src-ssr/package.json')
      hadToCreateFiles = true
    } else {
      const sourceSuffixPackageJsonPath =
        modeName === 'bex'
          ? `${await getScriptFormat(cacheProxy)}/package.json`
          : 'common/package.json'

      fse.copySync(
        appPaths.resolve.cli(
          `templates/${modeName}/${sourceSuffixPackageJsonPath}`
        ),
        packageJsonPath
      )

      info(`Created missing package.json in /src-${modeName}`)
      hadToCreateFiles = true
    }
  }

  const pnpmWorkspaceYamlPath = appPaths.resolve[modeName](
    'pnpm-workspace.yaml'
  )
  if (!existsSync(pnpmWorkspaceYamlPath)) {
    const nodePackager = await cacheProxy.getModule('nodePackager')
    // If the user is not using pnpm, and they are deleting the pnpm workspace file on purpose,
    // re-creating could be annoying. So, we only create it if using pnpm.
    if (nodePackager.name === 'pnpm') {
      fse.copySync(
        appPaths.resolve.cli(`templates/workspace/pnpm-workspace.yaml`),
        pnpmWorkspaceYamlPath
      )

      info(`Created missing pnpm-workspace.yaml in /src-${modeName}`)
      hadToCreateFiles = true
    }
  }

  return hadToCreateFiles
}

/**
 * @param {import('../../types/configuration/context').QuasarMode} modeName
 * @param {Object} opts
 * @param {import('../../types/app-paths').QuasarAppPaths} opts.appPaths
 * @param {import('../../types/configuration/context').CacheProxy} opts.cacheProxy
 * @param {boolean} force - maybe mode package.json was missing
 */
export async function ensureModeDeps(
  modeName,
  { appPaths, cacheProxy },
  force = false
) {
  if (
    modeName === 'spa' ||
    (!force && existsSync(appPaths.resolve[modeName]('node_modules')))
  ) {
    return
  }

  if (modeName === 'cordova') {
    // Cordova CLI works only with NPM...
    const { spawnSync } = await import('../utils/spawn.js')
    await spawnSync('npm', ['install'], {
      cwd: appPaths.cordovaDir,
      env: { NODE_ENV: 'development' }
    })
  } else {
    const nodePackager = await cacheProxy.getModule('nodePackager')
    await nodePackager.install({ cwd: appPaths[`${modeName}Dir`] })
  }
}

/**
 * @param {import('../../types/configuration/context').QuasarMode} modeName
 * @param {Object} opts
 * @param {import('../../types/app-paths').QuasarAppPaths} opts.appPaths
 * @param {import('../../types/configuration/context').CacheProxy} opts.cacheProxy
 */
export async function copyModeWorkspace(modeName, { appPaths, cacheProxy }) {
  if (modeName === 'spa' || modeName === 'cordova') return

  const nodePackager = await cacheProxy.getModule('nodePackager')
  if (nodePackager.name === 'pnpm') {
    fse.copySync(
      appPaths.resolve.cli('templates/workspace'),
      appPaths[`${modeName}Dir`]
    )
  }
}
