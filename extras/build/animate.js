import { writeFileSync } from 'node:fs'
import { basename, join, resolve } from 'node:path'
import { globSync } from 'tinyglobby'
import fse from 'fs-extra'

const packageName = 'animate.css'

// ------------

const distFolder = resolve(import.meta.dirname, '../exports/animate')

const pkgFolder = resolve(
  import.meta.dirname,
  `../node_modules/${packageName}/`
)
const cssFiles = globSync(pkgFolder + '/source/*/*.css')
const cssNames = new Set()

const inAnimations = []
const outAnimations = []
const generalAnimations = []

function extract(file) {
  const name = basename(file).match(/(.*)\.css/)[1]

  if (cssNames.has(name)) return

  fse.copySync(file, join(distFolder, name + '.css'))
  cssNames.add(name)

  if (name.includes('In')) {
    inAnimations.push(name)
  } else if (name.includes('Out')) {
    outAnimations.push(name)
  } else {
    generalAnimations.push(name)
  }
}

function getList(prefix) {
  return `${prefix}generalAnimations = ${JSON.stringify(generalAnimations, null, 2)}

${prefix}inAnimations = ${JSON.stringify(inAnimations, null, 2)}

${prefix}outAnimations = ${JSON.stringify(outAnimations, null, 2)}
`
}

if (cssFiles.length === 0) {
  console.log('WARNING. Animate.css skipped completely')
} else {
  cssFiles.forEach(file => {
    extract(file)
  })

  generalAnimations.sort()
  inAnimations.sort()
  outAnimations.sort()

  fse.copySync(join(pkgFolder, 'LICENSE'), join(distFolder, 'LICENSE'))

  writeFileSync(
    join(distFolder, 'animate-list.js'),
    getList('export const ').replaceAll('"', "'"),
    'utf8'
  )

  writeFileSync(
    join(distFolder, 'animate-list.d.ts'),
    getList('export type ')
      .replaceAll(' [', '')
      .replaceAll('\n]', ';')
      .replaceAll(/ {2}"/g, '  | "')
      .replaceAll(',', ''),
    'utf8'
  )
}
