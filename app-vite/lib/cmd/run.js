import { getArgv } from '../utils/get-argv.js'

const argv = getArgv(
  {
    'no-color': { type: 'boolean' }
  },
  { strict: false }
)

const extId = argv._[0]
const cmd = argv._[1]

if (!extId) {
  console.log(`
  Description
    Run app extension provided commands

  Usage
    $ quasar run <extension-id> <cmd> [...args]

    $ quasar run iconify create pic -s --mark some_file
        # Note: "iconify" is an example and not a real extension.
        # Looks for installed extension called "iconify"
        # (quasar-app-extension-iconify extension package)
        # and runs its custom defined "create" command
        # with "pic" argument and "-s --mark some_file" params

  Options
    --no-color  Disable colored output
  `)

  process.exit(0)
}

import { log, warn } from '../utils/logger.js'
import { getExtensionLogger } from '../app-extension/logger.js'

import { getCtx } from '../utils/get-ctx.js'

const { appExt } = getCtx()

const ext = appExt.getInstance(extId)
if (ext === void 0) {
  warn()
  getExtensionLogger(extId).warn('No such App Extension is installed')
  warn()
  process.exit(1)
}

const hooks = await ext.run()

const list = () => {
  if (Object.keys(hooks.commands).length === 0) {
    ext.logger.warn(`App Extension has no commands registered`)
    return
  }

  const cmdList = Object.keys(hooks.commands).join(' | ')
  ext.logger.log(`Command list: ${cmdList}`)
}

if (!cmd) {
  list()
  process.exit(0)
}

const fn = hooks.commands[cmd]
if (!fn) {
  list()
  warn()
  ext.logger.warn(`App Extension has no command called "${cmd}"`)
  warn()
  process.exit(1)
}

ext.logger.log(`Running App Extension command "${cmd}"`)
log()

process.argv = [
  ...process.argv.slice(0, 2),
  ...process.argv.slice(4).filter(arg => arg !== '--no-color')
]

await fn(process.argv)
