import { readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import gradient from 'gradient-string'

const source = `
 ██████╗ ██╗   ██╗ █████╗ ███████╗ █████╗ ██████╗
██╔═══██╗██║   ██║██╔══██╗██╔════╝██╔══██╗██╔══██╗
██║   ██║██║   ██║███████║███████╗███████║██████╔╝
██║▄▄ ██║██║   ██║██╔══██║╚════██║██╔══██║██╔══██╗
╚██████╔╝╚██████╔╝██║  ██║███████║██║  ██║██║  ██║
 ╚══▀▀═╝  ╚═════╝ ╚═╝  ╚═╝╚══════╝╚═╝  ╚═╝╚═╝  ╚═╝
`

const rawFilePath = join(import.meta.dirname, '../assets/cli-banner.raw.txt')
writeFileSync(rawFilePath, source, 'utf8')

const colorFilePath = join(
  import.meta.dirname,
  '../assets/cli-banner.color.txt'
)
writeFileSync(
  colorFilePath,
  gradient('#1976D2', '#a82f37').multiline(source, {}),
  'utf8'
)

console.log(readFileSync(rawFilePath, 'utf8'))
console.log(readFileSync(colorFilePath, 'utf8'))
