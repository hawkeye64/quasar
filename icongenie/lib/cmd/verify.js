import { getArgv } from '../utils/get-argv.js'

const argv = getArgv({
  mode: { type: 'string', short: 'm' },
  profile: { type: 'string', short: 'p' },
  filter: { type: 'string', short: 'f' },

  'no-color': { type: 'boolean' },
  help: { type: 'boolean', short: 'h' }
})

if (argv.help) {
  const { modes } = await import('../modes/index.js')
  const modesList = Object.keys(modes).join('|')

  const { generators } = await import('../generators/index.js')
  const generatorsList = Object.keys(generators).join('|')

  console.log(`
  Description
    Verifies your Quasar App's icons and splashscreens
    for all installed modes.

  Usage
    $ icongenie verify [options]

    # verify all Quasar modes
    $ icongenie verify

    # verify specific mode
    $ icongenie verify -m spa

    # verify with specific filter
    $ icongenie verify -f ico

    # verify by using a profile file
    $ icongenie verify -p ./icongenie-profile.json

    # verify by using batch of profile files
    $ icongenie verify -p ./folder-containing-profile-files

  Options
    --mode, -m      For which Quasar mode(s) to verify the assets;
                    Default: all
                      [all|${modesList}]
                    Multiple can be specified, separated by ",":
                      spa,cordova,capacitor

    --filter, -f    Filter the available generators; when used, it verifies
                    only one type of asset instead of all
                      [${generatorsList}]

    --profile       Use JSON profile file(s) to extract the asset list to verify:
                      - path to folder (absolute or relative to current folder)
                        that contains JSON profile files (icongenie-*.json)
                      - path to a single *.json profile file (absolute or relative
                        to current folder)
                    Structure of a JSON profile file:
                      {
                        "params": {
                          "include": [ ... ], /* optional */
                          ...
                        },
                        "assets": [ /* list of custom assets */ ]
                      }

    --no-color      Disable colored output
    --help, -h      Displays this message
  `)

  argv.__warn?.()
  process.exit(0)
}

import { parseArgv } from '../utils/parse-argv.js'
import { verify } from '../runner/verify.js'
import { getProfileFiles } from '../utils/get-profile-files.js'
import { filterArgvParams } from '../utils/filter-argv-params.js'
import { log } from '../utils/logger.js'

async function runProfiles(params, profileFiles) {
  for (let i = 0; i < profileFiles.length; i++) {
    const profile = profileFiles[i]

    console.log(`\n`)
    log(`--------------------`)
    log(`Verifying by profile: ${profile}`)
    log(`--------------------`)
    console.log(`\n`)

    await verify({ ...params, profile })
  }
}

const params = filterArgvParams(argv)

if (params.profile) {
  parseArgv(params, ['profile'])
  // oxlint-disable-next-line unicorn/prefer-top-level-await
  runProfiles(params, getProfileFiles(params.profile))
} else {
  verify(params)
}
