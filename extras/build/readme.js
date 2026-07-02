import { readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'

import { svgRows, webfontRows } from './readme-data.js'
import extrasPkg from '../package.json' with { type: 'json' }

const extrasRoot = resolve(import.meta.dirname, '..')

function resolvePackageSpecVersion(name) {
  const spec =
    extrasPkg.devDependencies?.[name] || extrasPkg.dependencies?.[name]

  if (spec === void 0) {
    throw new Error(`Missing package spec for ${name}`)
  }

  if (spec.startsWith('npm:')) {
    return spec.slice(spec.lastIndexOf('@') + 1)
  }

  return spec.replace(/^[~^]/, '')
}

function resolveFileVersion(path, pattern) {
  const content = readFileSync(resolve(extrasRoot, 'exports', path), 'utf8')
  const match = content.match(pattern)

  if (match === null) {
    throw new Error(`Could not resolve version from ${path}`)
  }

  return match[1]
}

function resolveVersion(versionSource, googleVersions) {
  switch (versionSource.type) {
    case 'google': {
      const version = googleVersions[versionSource.key]

      if (version === void 0) {
        throw new Error(`Missing Google CDN version for ${versionSource.key}`)
      }

      return `CDN ${version}`
    }

    case 'file': {
      return resolveFileVersion(versionSource.path, versionSource.pattern)
    }

    case 'packageSpec': {
      return resolvePackageSpecVersion(versionSource.name)
    }

    default: {
      throw new Error(`Unknown version source type: ${versionSource.type}`)
    }
  }
}

function renderTable(headers, rows) {
  const widths = headers.map((header, index) => {
    const rowWidths = rows.map(row => String(row[index]).length)
    return Math.max(header.length, ...rowWidths)
  })

  const renderRow = cells =>
    `| ${cells.map((cell, index) => String(cell).padEnd(widths[index])).join(' | ')} |`
  const separator = `| ${widths.map(width => '-'.repeat(width)).join(' | ')} |`

  return [renderRow(headers), separator, ...rows.map(renderRow)].join('\n')
}

function renderRows(rows, googleVersions, type) {
  return rows.map(row => {
    if (type === 'webfont') {
      return [
        row.vendor,
        resolveVersion(row.versionSource, googleVersions),
        row.extrasName,
        row.description,
        row.notes,
        row.license
      ]
    }

    return [
      row.vendor,
      resolveVersion(row.versionSource, googleVersions),
      row.iconSetName,
      row.importFrom,
      row.notes,
      row.license
    ]
  })
}

export function generateReadme({ googleVersions }) {
  const template = readFileSync(
    resolve(import.meta.dirname, 'README.template.md'),
    'utf8'
  )
  const webfontsTable = renderTable(
    [
      'Vendor',
      'Version',
      'quasar.conf.js extras name',
      'Description',
      'Notes',
      'License'
    ],
    renderRows(webfontRows, googleVersions, 'webfont')
  )
  const svgTable = renderTable(
    [
      'Vendor',
      'Version',
      'Quasar IconSet name',
      'Import Icons from',
      'Notes',
      'License'
    ],
    renderRows(svgRows, googleVersions, 'svg')
  )

  const readme = template
    .replace('{{WEBFONTS_TABLE}}', webfontsTable)
    .replace('{{SVG_TABLE}}', svgTable)

  writeFileSync(resolve(extrasRoot, 'README.md'), readme, 'utf8')
}
