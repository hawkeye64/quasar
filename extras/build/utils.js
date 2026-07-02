import { basename, resolve } from 'node:path'
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import xmldom from '@xmldom/xmldom'

const Parser = new xmldom.DOMParser()
const typeExceptions = ['g', 'svg', 'defs', 'style', 'title']

// --------------------------------------------------------
// Helper Functions
// --------------------------------------------------------

const chunkArray = (arr, size = 2) =>
  Array.from({ length: Math.ceil(arr.length / size) }, (_, i) =>
    arr.slice(i * size, i * size + size)
  )

const calcValue = (val, base) =>
  String(val).endsWith('%')
    ? (Number.parseFloat(val) * base) / 100
    : Number(val)

const getAttributes = (el, list) =>
  list.reduce((attrs, name) => {
    attrs[name] = Number.parseFloat(el.getAttribute(name) || 0)
    return attrs
  }, {})

// function getCurvePath (x, y, rx, ry) {
//   return `A${rx},${ry},0,0,1,${x},${y}`
// }

const getRecursiveAttributes = el =>
  el.parentNode?.attributes
    ? `${getRecursiveAttributes(el.parentNode)}${getAttributesAsStyle(el)}`
    : getAttributesAsStyle(el)

const getAttributesAsStyle = el => {
  // make sure this set stays ordered
  const exceptions = new Set([
    'aria-hidden',
    'aria-label',
    'aria-labelledby',
    'baseProfile',
    'class',
    'clip-path',
    'cx',
    'cy',
    'd',
    'data-du',
    'data-name',
    'data-tags',
    'enable-background',
    'focusable',
    'height',
    'id',
    'mask',
    'name',
    'points',
    'r',
    'role',
    'rx',
    'ry',
    'style',
    'transform',
    'version',
    'viewBox',
    'width',
    'x',
    'x1',
    'x2',
    'xml:space',
    'xmlns',
    'xmlns:xlink',
    'y',
    'y1',
    'y2'
  ])

  return [...el.attributes]
    .filter(({ namespaceURI }) => namespaceURI === null)
    .filter(({ nodeName }) => !exceptions.has(nodeName))
    .map(({ nodeName, nodeValue }) => `${nodeName}:${nodeValue};`)
    .join('')
}

const getRecursiveTransforms = el =>
  el.parentNode?.attributes
    ? `${getRecursiveTransforms(el.parentNode)}${el.getAttribute('transform') || ''}`
    : el.getAttribute('transform') || ''

// --------------------------------------------------------
// SVG Decoders
// --------------------------------------------------------

const decoders = {
  svg: () => '', // Nothing here. This is needed to grab any attributes on svg tag..

  path: el => {
    const points = el.getAttribute('d')?.trim()
    if (!points) throw new Error('No points found in path')
    return points.startsWith('m') ? 'M0 0z' + points : points
  },

  circle: el => {
    const { cx = 0, cy = 0, r } = getAttributes(el, ['cx', 'cy', 'r'])
    return `M${cx} ${cy} m-${r}, 0 a${r},${r} 0 1,0 ${r * 2},0 a${r},${r} 0 1,0 ${-r * 2},0`
  },

  ellipse: el => {
    const {
      cx = 0,
      cy = 0,
      rx,
      ry
    } = getAttributes(el, ['cx', 'cy', 'rx', 'ry'])
    return `M${cx - rx},${cy} a${rx},${ry} 0 1,0 ${2 * rx},0 a${rx},${ry} 0 1,0 ${-2 * rx},0Z`
  },

  polygon: el => decoders.polyline(el) + 'z',

  polyline: el => {
    const points = el.getAttribute('points') || ''
    const pairs = chunkArray(points.split(/[\s,]+/).filter(Boolean), 2)
    return pairs.map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x} ${y}`).join(' ')
  },

  rect(el) {
    const att = getAttributes(el, ['x', 'y', 'width', 'height', 'rx', 'ry'])
    const w = Number(att.width)
    const h = Number(att.height)
    const x = att.x ? Number(att.x) : 0
    const y = att.y ? Number(att.y) : 0
    let rx = att.rx || 'auto'
    let ry = att.ry || 'auto'
    if (rx === 'auto' && ry === 'auto') {
      rx = ry = 0
    } else if (rx !== 'auto' && ry === 'auto') {
      rx = ry = calcValue(rx, w)
    } else if (ry !== 'auto' && rx === 'auto') {
      ry = rx = calcValue(ry, h)
    } else {
      rx = calcValue(rx, w)
      ry = calcValue(ry, h)
    }
    if (rx > w / 2) {
      rx = w / 2
    }
    if (ry > h / 2) {
      ry = h / 2
    }
    const hasCurves = rx > 0 && ry > 0
    return [
      `M${x + rx} ${y}`,
      `H${x + w - rx}`,
      ...(hasCurves ? [`A${rx} ${ry} 0 0 1 ${x + w} ${y + ry}`] : []),
      `V${y + h - ry}`,
      ...(hasCurves ? [`A${rx} ${ry} 0 0 1 ${x + w - rx} ${y + h}`] : []),
      `H${x + rx}`,
      ...(hasCurves ? [`A${rx} ${ry} 0 0 1 ${x} ${y + h - ry}`] : []),
      `V${y + ry}`,
      ...(hasCurves ? [`A${rx} ${ry} 0 0 1 ${x + rx} ${y}`] : []),
      'z'
    ].join(' ')
  },

  line: el => {
    const {
      x1 = 0,
      y1 = 0,
      x2 = 0,
      y2 = 0
    } = getAttributes(el, ['x1', 'y1', 'x2', 'y2'])
    return `M${x1},${y1}L${x2},${y2}`
  }
}

function parseDom(name, el, pathsDefinitions) {
  const type = el.nodeName

  if (el.getAttribute === void 0 || el.getAttribute('opacity') === '0') return

  if (!typeExceptions.includes(type)) {
    if (decoders[type] === void 0) {
      throw new Error(`Unsupported tag: "${type}" in ${name}`)
    }

    const style = el.getAttribute('style') || ''
    let strAttributes = (style + getRecursiveAttributes(el)).replaceAll(
      ';;',
      ';'
    )

    // don't allow fill to be both 'none' and 'currentColor'
    // this is common because of the inheritance of 'fill:none' from an 'svg' tag
    if (
      strAttributes.includes('fill:none;') &&
      strAttributes.includes('fill:currentColor;')
    ) {
      strAttributes = strAttributes.replace(/fill:none;/, '')
    }

    const arrAttributes = strAttributes.split(';')
    const combinedStyles = new Set(arrAttributes)

    const transform = getRecursiveTransforms(el)

    const paths = {
      path: decoders[type](el),
      style: [...combinedStyles].join(';'),
      transform
    }

    if (paths.path.length !== 0) {
      pathsDefinitions.push(paths)
    }
  }

  ;[...el.childNodes].forEach(child => {
    parseDom(name, child, pathsDefinitions)
  })
}

function getWidthHeightAsViewbox(element) {
  // Retrieve width and height attributes
  const width = Number.parseFloat(element.getAttribute('width') || '0')
  const height = Number.parseFloat(element.getAttribute('height') || '0')

  // Ensure both width and height are valid numbers
  if (width > 0 && height > 0) {
    return `0 0 ${width} ${height}`
  }

  // Return an empty string if width or height is missing or invalid
  return ''
}

function parseSvgContent(name, content) {
  let viewBox
  const pathsDefinitions = []

  try {
    const dom = Parser.parseFromString(content, 'text/xml')

    viewBox = dom.documentElement.getAttribute('viewBox')

    if (!viewBox) {
      // check if there is width and height
      viewBox = getWidthHeightAsViewbox(dom.documentElement)
    }

    parseDom(name, dom.documentElement, pathsDefinitions)
  } catch (err) {
    console.error(`[Error] "${name}" could not be parsed: ${err.message}`)
    throw err
  }

  if (pathsDefinitions.length === 0) {
    throw new Error(`Could not infer any paths for "${name}"`)
  }

  const tmpView = `|${viewBox}`

  return {
    viewBox: viewBox !== '0 0 24 24' && tmpView !== '|' ? tmpView : '',
    paths: pathsDefinitions.every(def => !def.style && !def.transform)
      ? pathsDefinitions.map(def => def.path).join('')
      : pathsDefinitions
          .map(def => {
            let stylePart = def.style ? `@@${def.style}` : '' // Include style only if it is non-empty
            const transformPart = def.transform ? `@@${def.transform}` : '' // Include transform only if it is non-empty

            // If style is empty but transform is not, we need a special case
            if (!def.style && def.transform) {
              stylePart = '@@' // Empty style needs to output "@@" when transform exists
            }

            // Combine path with stylePart and transformPart
            return `${def.path}${stylePart}${transformPart}`
          })
          .join('&&')
  }
}

function getPackageJson(packageName) {
  let file = resolve(
    import.meta.dirname,
    `../node_modules/${packageName}/package.json`
  )
  if (existsSync(file)) {
    const content = readFileSync(file, 'utf8')
    if (!content.includes('_pnpmPlaceholder')) {
      return JSON.parse(content)
    }
  }

  file = resolve(
    import.meta.dirname,
    `../node_modules/${packageName}/bower.json`
  )
  if (existsSync(file)) return JSON.parse(readFileSync(file, 'utf8'))

  console.error(
    'Could not locate package.json or bower.json for ' + packageName
  )
  process.exit(1)
}

function getVersion(versionOrPackageName) {
  if (versionOrPackageName === '') return ''
  if (/^\d/.test(versionOrPackageName)) return `v${versionOrPackageName}`

  const { version } = getPackageJson(versionOrPackageName)
  return `v${version}`
}

export function getBanner(iconSetName, versionOrPackageName) {
  return `/* ${iconSetName} ${getVersion(versionOrPackageName)} */\n\n`
}

export function defaultNameMapper(filePath, prefix) {
  return (prefix + '-' + basename(filePath, '.svg')).replaceAll(/(-\w)/g, m =>
    m[1].toUpperCase()
  )
}

export function extractSvg(content, name) {
  const { paths, viewBox } = parseSvgContent(name, content)

  const path = paths.replaceAll(/[\r\n\t]+/gi, ',').replaceAll(',,', ',')

  return {
    svgDef: `export const ${name} = '${path}${viewBox}'`,
    typeDef: `export declare const ${name}: string;`
  }
}

export function extract(filePath, name) {
  const content = readFileSync(filePath, 'utf8')
  return extractSvg(content, name)
}

export function writeExports(
  iconSetName,
  versionOrPackageName,
  distFolder,
  svgExports,
  typeExports,
  skipped
) {
  if (svgExports.length === 0) {
    console.log(`WARNING. ${iconSetName} skipped completely`)
  } else {
    const banner = getBanner(iconSetName, versionOrPackageName)
    const distIndex = `${distFolder}/index`

    const content = banner + svgExports.sort().join('\n')

    writeFileSync(`${distIndex}.js`, content, 'utf8')
    writeFileSync(
      `${distIndex}.d.ts`,
      banner + typeExports.sort().join('\n'),
      'utf8'
    )

    if (skipped.length !== 0) {
      console.log(`${iconSetName} - skipped (${skipped.length}): ${skipped}`)
    }
  }
}

export function sleep(delay = 0) {
  return new Promise(resolvePromise => {
    setTimeout(resolvePromise, delay)
  })
}

export async function waitUntil(test, options = {}) {
  const { delay = 5e3, tries = -1 } = options
  const { predicate, result } = await test()

  if (predicate) {
    return result
  }

  if (tries - 1 === 0) {
    throw new Error('tries limit reached')
  }

  await sleep(delay)
  return waitUntil(test, { ...options, tries: tries > 0 ? tries - 1 : tries })
}

export async function retry(tryFunction, options = {}) {
  const { retries = 3 } = options

  let tries = 0
  let output = null
  let exitErr = null

  const bail = err => {
    exitErr = err
  }

  while (tries < retries) {
    tries += 1
    try {
      output = await tryFunction({ tries, bail })
      break
    } catch (err) {
      if (tries >= retries) {
        throw err
      }
    }
  }

  if (exitErr) {
    // oxlint-disable-next-line no-throw-literal
    throw exitErr
  }

  return output
}

export class Queue {
  pendingEntries = []

  inFlight = 0

  err = null

  constructor(worker, options = {}) {
    this.worker = worker
    this.concurrency = options.concurrency || 1
  }

  push(...entry) {
    this.pendingEntries.push(...entry)
    this.process()
  }

  process() {
    const scheduled = this.pendingEntries.splice(
      0,
      this.concurrency - this.inFlight
    )
    this.inFlight += scheduled.length
    scheduled.forEach(async task => {
      try {
        await this.worker(task)
      } catch (err) {
        this.err = err
      } finally {
        this.inFlight -= 1
      }

      if (this.pendingEntries.length !== 0) {
        this.process()
      }
    })
  }

  wait(options = {}) {
    return waitUntil(
      () => {
        if (this.err) {
          this.pendingEntries = []
          throw this.err
        }

        return {
          predicate: options.empty
            ? this.inFlight === 0 && this.pendingEntries.length === 0
            : this.concurrency > this.pendingEntries.length
        }
      },
      {
        delay: 50
      }
    )
  }
}

export function copyCssFile({ from, to, replaceFn }) {
  if (!existsSync(from)) {
    console.error(`[Error] ${from} does not exist`)
    process.exit(1)
  }

  const content = readFileSync(from, 'utf8')
  const newContent = replaceFn !== void 0 ? replaceFn(content) : content

  writeFileSync(to, newContent, 'utf8')
}
