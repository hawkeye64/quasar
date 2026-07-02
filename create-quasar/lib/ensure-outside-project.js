import { existsSync } from 'node:fs'
import { join, normalize, sep } from 'node:path'

const quasarConfigFilenameList = [
  'quasar.config.js',
  'quasar.config.mjs',
  'quasar.config.ts',
  'quasar.config.cjs',
  'quasar.conf.js' // legacy
]

export function isInsideQuasarProject() {
  let dir = process.cwd()

  while (dir.length !== 0 && dir.at(-1) !== sep) {
    for (const name of quasarConfigFilenameList) {
      const filename = join(dir, name)
      if (existsSync(filename)) return true
    }

    dir = normalize(join(dir, '..'))
  }

  return false
}
