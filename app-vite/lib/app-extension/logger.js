import {
  dot,
  error,
  fatal,
  info,
  log,
  progress,
  success,
  tip,
  warn,
  warning
} from '../utils/logger.js'

export function getExtensionLogger(extId) {
  const aePill = `AE (${extId})`
  const compose = title => `${aePill} ${dot} ${title}`

  return Object.freeze({
    dot,
    log: msg => log(msg, aePill),
    warn: msg => warn(msg, aePill),
    fatal: msg => fatal(msg, aePill),
    info: (msg, title = 'INFO') => info(msg, compose(title)),
    success: (msg, title = 'SUCCESS') => success(msg, compose(title)),
    error: (msg, title = 'ERROR') => error(msg, compose(title)),
    warning: (msg, title = 'WARNING') => warning(msg, compose(title)),
    tip: msg => tip(`${aePill} ${dot} ${msg}`),
    progress: ({ tool, ...opts }) =>
      progress({ ...opts, tool: `${aePill} ${dot} ${tool}` })
  })
}
