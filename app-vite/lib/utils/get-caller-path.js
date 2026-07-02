import { dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

export function getCallerPath(index = 0) {
  const originalPrepareStackTrace = Error.prepareStackTrace

  try {
    Error.prepareStackTrace = (_, stack) => stack
    const err = new Error('err')

    Error.captureStackTrace(err, getCallerPath)
    const filename = err.stack[index].getFileName()

    return dirname(
      filename.startsWith('file://') ? fileURLToPath(filename) : filename
    )
  } finally {
    Error.prepareStackTrace = originalPrepareStackTrace
  }
}
