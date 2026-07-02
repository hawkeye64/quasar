#!/usr/bin/env node

if (
  process.argv.includes('--no-color') ||
  (await import('ci-info').then(({ isCI }) => isCI))
) {
  process.env.FORCE_COLOR = '0'
}

// oxlint-disable-next-line import/no-unassigned-import
import '../lib/node-version-check.js'

const commands = [
  'dev',
  'build',
  'prepare',
  'clean',
  'inspect',
  'describe',
  'ext',
  'run',
  'mode',
  'info',
  'new',
  'help'
]

let cmd = process.argv[2] ?? 'help'

if (cmd.length === 1) {
  const mapToCmd = {
    d: 'dev',
    b: 'build',
    p: 'prepare',
    e: 'ext',
    r: 'run',
    c: 'clean',
    m: 'mode',
    i: 'info',
    n: 'new',
    h: 'help'
  }
  cmd = mapToCmd[cmd]
}

if (commands.includes(cmd)) {
  process.argv.splice(2, 1)
} else {
  if (cmd === '-v' || cmd === '--version') {
    const { cliPkg } = await import('../lib/utils/cli-runtime.js')

    console.log(
      `${cliPkg.name} ${cliPkg.version}` +
        (process.env.QUASAR_CLI_VERSION
          ? ` (@quasar/cli ${process.env.QUASAR_CLI_VERSION})`
          : '')
    )

    process.exit(0)
  }

  const { warn } = await import('../lib/utils/logger.js')

  if (cmd === '-h' || cmd === '--help') {
    cmd = 'help'
  } else if (cmd.indexOf('-') === 0) {
    await import(`../lib/cmd/help.js`)
    warn('Command must come before the options\n')
    process.exit(1)
  } else {
    await import(`../lib/cmd/help.js`)
    warn(`Unrecognized command "${cmd}"\n`)
    process.exit(1)
  }
}

import(`../lib/cmd/${cmd}.js`)
