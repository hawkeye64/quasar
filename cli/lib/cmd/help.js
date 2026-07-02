import { showCliBanner } from '@quasar/art'
import { italic } from 'kolorist'

import { cliPkg } from '../cli-pkg.js'

showCliBanner()
console.log('  Running @quasar/cli v' + cliPkg.version)

console.log(`
  Example usage
    $ quasar <command> <options>

  Help for a command
    $ quasar <command> --help
    $ quasar <command> -h

  Options
    --no-color    Disable colored output
    --version, -v Print Quasar CLI version

  Commands
    info      Display info about your machine
                   (and your App if in a project folder)
    upgrade   Check (and optionally) upgrade Quasar packages
                   from a Quasar project folder
    serve     Create an ad-hoc server on App's distributables
    help, -h  Displays this message

  --------------
  => IMPORTANT !
  => ${italic('Trigger this inside of a Quasar project (and pnpm/yarn/npm/bun install) for more commands.')}
  --------------
`)
