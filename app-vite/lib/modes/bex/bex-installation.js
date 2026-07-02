import fse from 'fs-extra'

import { createPromptSession, warn } from '../../utils/logger.js'
import {
  copyModeWorkspace,
  ensureModeDeps,
  ensureModePackageJsonAndWorkspace,
  isModeInstalled
} from '../modes-utils.js'

/**
 * @param {{
 *   ctx: import('../../../types/configuration/context').InternalQuasarContext,
 *   silent: boolean
 * }} options
 */
export async function addMode({ ctx, silent }) {
  const { appPaths, cacheProxy } = ctx

  if (isModeInstalled(appPaths, 'bex')) {
    const forceInstall = await ensureModePackageJsonAndWorkspace('bex', ctx)
    await ensureModeDeps('bex', ctx, forceInstall)

    if (silent !== true) {
      warn('BEX support detected already. Aborting.')
    }

    return
  }

  const promptSession = await createPromptSession('Installing BEX Mode...')

  const copyTask = promptSession.taskLog({ title: 'Creating /src-bex...' })

  await copyModeWorkspace('bex', ctx)
  fse.copySync(appPaths.resolve.cli('templates/bex/common'), appPaths.bexDir)

  const hasTypescript = await cacheProxy.getModule('hasTypescript')
  const format = hasTypescript ? 'ts' : 'js'
  fse.copySync(appPaths.resolve.cli(`templates/bex/${format}`), appPaths.bexDir)

  copyTask.success('Created /src-bex')
  await ensureModeDeps('bex', ctx, true)

  promptSession.end('BEX support was added')
}
