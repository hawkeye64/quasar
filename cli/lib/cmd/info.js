import { green, red } from 'kolorist'
import { getArgv } from '../get-argv.js'

const argv = getArgv({
  'no-color': { type: 'boolean' },
  help: { type: 'boolean', short: 'h' }
})

if (argv.help) {
  console.log(`
  Description
    Displays information about your machine and your Quasar App.

  Usage
    $ quasar info

  Options
    --no-color     Disable colored output
    --help, -h     Displays this message
  `)

  argv.__warn?.()
  process.exit(0)
}

import os from 'node:os'
import { sync as spawn } from 'cross-spawn'

import { getExternalNetworkInterface as getExternalIPs } from '../net.js'
import { cliPkg } from '../cli-pkg.js'

function getSpawnOutput(command) {
  try {
    const child = spawn(command, ['--version'])
    return child.status === 0
      ? green(String(child.output[1]).trim())
      : red('Not installed')
  } catch {
    return red('Not installed')
  }
}

const output = [
  {
    key: 'Operating System',
    value: green(
      `${os.type()}(${os.release()}) - ${os.platform()}/${os.arch()}`
    ),
    section: true
  },
  { key: 'NodeJs', value: green(process.version.slice(1)) },
  { key: 'Global packages', section: true },
  { key: '  NPM', value: getSpawnOutput('npm') },
  { key: '  yarn', value: getSpawnOutput('yarn') },
  { key: '  pnpm', value: getSpawnOutput('pnpm') },
  { key: '  bun', value: getSpawnOutput('bun') },
  { key: '  @quasar/cli', value: green(cliPkg.version) },
  { key: '  @quasar/icongenie', value: getSpawnOutput('icongenie') },
  { key: '  cordova', value: getSpawnOutput('cordova') },
  { key: 'Networking', section: true },
  { key: '  Host', value: green(os.hostname()) }
]

getExternalIPs().forEach(intf => {
  output.push({
    key: `  ${intf.deviceName}`,
    value: green(intf.address)
  })
})

const spaces = output.reduce((acc, v) => Math.max(acc, v.key.length), 0)
console.log(
  output
    .map(
      m =>
        `${m.section ? '\n' : ''}${m.key}${' '.repeat(spaces - m.key.length)}\t${m.value === void 0 ? '' : m.value}`
    )
    .join('\n')
)
console.log()
