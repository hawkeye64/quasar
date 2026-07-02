import { writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { globSync } from 'tinyglobby'
import fse from 'fs-extra'

import {
  copyCssFile,
  defaultNameMapper,
  extract,
  getBanner,
  writeExports
} from './utils.js'

const packageName = 'themify-icons'
const distName = 'themify'
const iconSetName = 'Themify'
const prefix = 'ti'
const version = '1.0.1'

// ------------

const skipped = []
const distFolder = resolve(import.meta.dirname, '../exports/themify')

const svgFolder = resolve(
  import.meta.dirname,
  `../node_modules/${packageName}/SVG/`
)
const svgFiles = globSync(svgFolder + '/*.svg')
let iconNames = new Set()

const svgExports = []
const typeExports = []

svgFiles.forEach(file => {
  const name = defaultNameMapper(file, prefix)

  if (iconNames.has(name)) return

  try {
    const { svgDef, typeDef } = extract(file, name)
    const svgDef2 = svgDef.replaceAll('fill:#000000;', 'fill:currentColor;')
    svgExports.push(svgDef2)
    typeExports.push(typeDef)

    iconNames.add(name)
  } catch (err) {
    console.error(err)
    skipped.push(name)
  }
})

iconNames = [...iconNames]
svgExports.sort((a, b) => String(a).localeCompare(b))
typeExports.sort((a, b) => String(a).localeCompare(b))
iconNames.sort((a, b) => String(a).localeCompare(b))

writeExports(iconSetName, version, distFolder, svgExports, typeExports, skipped)

// then update webfont files

const banner = getBanner('Themify Icons', packageName)
const webfont = ['themify.woff']

webfont.forEach(file => {
  fse.copySync(
    resolve(
      import.meta.dirname,
      `../node_modules/${packageName}/fonts/${file}`
    ),
    resolve(distFolder, file)
  )
})

copyCssFile({
  from: resolve(
    import.meta.dirname,
    `../node_modules/${packageName}/css/themify-icons.css`
  ),
  to: resolve(distFolder, 'themify.css'),
  replaceFn: content =>
    banner +
    content
      .replace(/src:[^;]+;/, '')
      .replace(/src:[^;]+;/, "src: url('./themify.woff') format('woff');")
      .replace('font-display: swap;', 'font-display: block;')
      .replace('[class^="ti-"], [class*=" ti-"]', '.themify-icon')
})

// write the JSON file
const file = resolve(distFolder, 'icons.json')
writeFileSync(file, JSON.stringify([...iconNames].sort(), null, 2), 'utf8')

console.log(`${distName} done with ${iconNames.length} icons`)
