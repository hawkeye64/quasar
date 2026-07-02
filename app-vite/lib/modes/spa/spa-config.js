import { createViteConfig, extendViteConfig } from '../../config-tools.js'

/**
 * Warning!
 *
 * Remember to update this.#registerDiff() calls when adding/removing quasarConf
 * properties needed for the build.
 */
export const quasarSpaConfig = {
  vite: async quasarConf => {
    const cfg = await createViteConfig(quasarConf, {
      compileId: 'vite-spa',
      shippedToClient: true
    })

    return extendViteConfig(cfg, quasarConf, { isClient: true })
  }
}

export const modeConfig = quasarSpaConfig
