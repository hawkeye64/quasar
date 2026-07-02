import { log } from '../utils/logger.js'
import { getArgv } from '../utils/get-argv.js'

const argv = getArgv({
  silent: { type: 'boolean', short: 's', default: false },
  'no-color': { type: 'boolean' },
  help: { type: 'boolean', short: 'h' }
})

if (argv.help) {
  console.log(`
  Description
    Prepare the app for linting, type-checking, IDE integration, etc.
    It will generate the relevant files such as '.quasar/tsconfig.json', types files, etc.
    Running 'quasar dev' or 'quasar build' will automatically handle this for you.
    Use this command for a lightweight alternative to dev/build. Useful in CI/CD pipelines.

  Usage
    $ quasar prepare

  Options
    --silent, -s    Suppress the output
    --no-color      Disable colored output
    --help, -h      Displays this message
  `)

  argv.__warn?.()
  process.exit(0)
}

if (argv.silent) {
  const { supressLogger } = await import('../utils/logger.js')
  supressLogger()
} else {
  const { showCliBanner } = await import('@quasar/art')
  showCliBanner()
}

const { getCtx } = await import('../utils/get-ctx.js')
// ctx doesn't matter for this command
const ctx = getCtx({
  mode: 'spa',
  debug: false,
  prod: true
})

const { QuasarConfigFile } = await import('../quasar-config-file.js')
const quasarConfFile = new QuasarConfigFile({
  ctx,
  // host and port don't matter for this command
  port: 9000,
  host: 'localhost'
})

const quasarConf = await quasarConfFile.read()

const { generateTypes } = await import('../types-generator.js')
generateTypes(quasarConf)

log('Generated tsconfig.json and types files in .quasar directory')
log('The app is now prepared for linting, type-checking, IDE integration, etc.')
