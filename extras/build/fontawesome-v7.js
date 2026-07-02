import { existsSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { globSync } from 'tinyglobby'
import fse from 'fs-extra'

import {
  copyCssFile,
  defaultNameMapper,
  extract,
  writeExports
} from './utils.js'

const packageName = '@fortawesome/fontawesome-free'
const distName = 'fontawesome-v7'
const iconSetName = 'Fontawesome Free'
const prefix = 'fa'

// ------------

const skipped = []
const distFolder = resolve(import.meta.dirname, `../exports/${distName}`)

const svgFolder = resolve(
  import.meta.dirname,
  `../node_modules/${packageName}/svgs/`
)
const iconTypes = ['brands', 'regular', 'solid']
let iconNames = new Set()

const svgExports = []
const typeExports = []

iconTypes.forEach(type => {
  const svgFiles = globSync(svgFolder + `/${type}/*.svg`)

  svgFiles.forEach(file => {
    const name = defaultNameMapper(file, prefix + type.at(0))

    if (iconNames.has(name)) return

    try {
      const { svgDef, typeDef } = extract(file, name)
      svgExports.push(svgDef)
      typeExports.push(typeDef)

      iconNames.add(name)
    } catch (err) {
      console.error(err)
      skipped.push(name)
    }
  })
})

iconNames = [...iconNames]
svgExports.sort((a, b) => String(a).localeCompare(b))
typeExports.sort((a, b) => String(a).localeCompare(b))
iconNames.sort((a, b) => String(a).localeCompare(b))

writeExports(
  iconSetName,
  packageName,
  distFolder,
  svgExports,
  typeExports,
  skipped
)

// then update webfont files

const webfont = [
  'fa-brands-400.woff2',
  'fa-regular-400.woff2',
  'fa-solid-900.woff2',
  'fa-v4compatibility.woff2'
]

const staleFiles = [
  'fa-brands-400.ttf',
  'fa-regular-400.ttf',
  'fa-solid-900.ttf',
  'fa-v4compatibility.ttf',
  'fontawesome-v6.css'
]

staleFiles.forEach(file => {
  const target = resolve(distFolder, file)
  if (existsSync(target)) fse.removeSync(target)
})

webfont.forEach(file => {
  fse.copySync(
    resolve(
      import.meta.dirname,
      `../node_modules/${packageName}/webfonts/${file}`
    ),
    resolve(distFolder, file)
  )
})

copyCssFile({
  from: resolve(
    import.meta.dirname,
    `../node_modules/${packageName}/css/all.css`
  ),
  to: resolve(distFolder, `${distName}.css`),
  replaceFn: content => content.replaceAll('../webfonts', '.')
})

fse.copySync(
  resolve(import.meta.dirname, `../node_modules/${packageName}/LICENSE.txt`),
  resolve(distFolder, 'LICENSE.txt')
)

// write the JSON file
const file = resolve(distFolder, 'icons.json')
writeFileSync(file, JSON.stringify([...iconNames].sort(), null, 2), 'utf8')

console.log(`${distName} done with ${iconNames.length} icons`)
