import { parseArgs } from 'node:util'
import { warn } from './logger.js'

function kebabToCamelCase(str) {
  return str
    .split('-')
    .map((part, index) =>
      index === 0 ? part : part.charAt(0).toUpperCase() + part.slice(1)
    )
    .join('')
}

function parseValues(values) {
  return Object.keys(values).reduce((acc, key) => {
    acc[kebabToCamelCase(key)] = values[key]
    return acc
  }, {})
}

export function getArgv(options, { strict = true } = {}) {
  try {
    const { values, positionals } = parseArgs({
      options,
      strict,
      allowPositionals: true
    })

    return { ...parseValues(values), _: positionals }
  } catch (err) {
    return {
      help: true,
      _: [],

      // Should be handled if (argv.help) in the caller
      __warn() {
        console.error(err)
        warn(
          err?.code === 'ERR_PARSE_ARGS_UNKNOWN_OPTION'
            ? err.message
            : 'Unknown error while parsing arguments'
        )
        warn()
        process.exit(1)
      }
    }
  }
}
