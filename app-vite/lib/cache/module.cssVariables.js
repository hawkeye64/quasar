import fs from 'node:fs'

export function createInstance({ appPaths }) {
  const cssVariables = {
    quasarSrcExt: 'css',
    variablesFile: false
  }

  for (const ext of ['scss', 'sass']) {
    if (
      fs.existsSync(appPaths.resolve.app(`src/css/quasar.variables.${ext}`))
    ) {
      cssVariables.quasarSrcExt = 'sass'
      cssVariables.variablesFile = `@/css/quasar.variables.${ext}`
      break
    }
  }

  return cssVariables
}
