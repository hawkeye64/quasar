import { readFileSync } from 'node:fs'
import { join } from 'node:path'

export function showCliBanner() {
  const type = process.env.FORCE_COLOR === '0' ? 'raw' : 'color'
  const filePath = join(import.meta.dirname, `./assets/cli-banner.${type}.txt`)

  console.log(readFileSync(filePath, 'utf8'))
}
