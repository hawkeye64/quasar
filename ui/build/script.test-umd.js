import fse from 'fs-extra'

import { resolveToRoot } from './build.utils.js'

const src = resolveToRoot('dist')
const dest = resolveToRoot('playground-umd/dist')

if (!fse.existsSync(src)) {
  console.error('\nERROR: please run "pnpm build" first\n')
  process.exit(0)
}

fse.removeSync(dest)
fse.symlinkSync(src, dest, 'dir')

const { default: open } = await import('open')
open(resolveToRoot('playground-umd/index.umd.html'), {
  app: { name: 'google chrome' }
})
