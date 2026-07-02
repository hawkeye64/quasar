import fs from 'node:fs'

import { warn } from './logger.js'
import { attachMarkup, entryPointMarkup } from '../plugins/vite.html.js'

export function appFilesValidations(appPaths) {
  let valid = true

  const file = appPaths.resolve.app('index.html')

  if (!fs.existsSync(file)) {
    warn('The file /index.html is missing. Please add it back.\n')
    return false
  }

  const content = fs.readFileSync(file, 'utf8')

  if (content.includes(attachMarkup)) {
    warn(`Please remove ${attachMarkup} from
    /index.html inside of <body>\n`)
    valid = false
  }

  if (!content.includes(entryPointMarkup)) {
    warn(`Please add ${entryPointMarkup} to
    /index.html inside of <body>\n`)
    valid = false
  }

  return valid
}
