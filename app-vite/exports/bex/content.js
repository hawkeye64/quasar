import { BexBridge } from './private/bex-bridge.js'

/**
 * Only run these in development mode and in Chrome.
 * Only Chrome allows the background counterpart initialization
 * to take place in a service worker.
 */
if (import.meta.env.QUASAR_DEV && import.meta.env.QUASAR_TARGET === 'chrome') {
  let scriptIsReloading = false

  const scriptName = import.meta.env.QUASAR_BEX_SCRIPT_NAME
  const portName = `quasar@hmr/content-script/${scriptName}`
  const banner = `[QBex|HMR] [${scriptName}]`

  const onMessage = message => {
    if (message === 'qbex:hmr:hello') {
      console.log(`${banner} Connected to background`)
      return
    }

    if (message === 'qbex:hmr:reload-content') {
      console.log(`${banner} Reload requested by background...`)
      scriptIsReloading = true

      // reload the page with a small delay,
      // to allow the extension to be also reloaded
      setTimeout(() => {
        window.location.reload()
      }, 100)
    }
  }

  const connect = () => {
    const port = chrome.runtime.connect({ name: portName })

    port.onMessage.addListener(onMessage)
    port.onDisconnect.addListener(() => {
      if (scriptIsReloading) return
      port.onMessage.removeListener(onMessage)

      console.log(
        chrome.runtime.lastError?.message?.includes(
          'Could not establish connection'
        )
          ? `${banner} Could not connect to background`
          : `${banner} Lost connection to background`
      )

      setTimeout(connect, 1000)
    })
  }

  connect()
}

let scriptHasBridge = false

export function createBridge({ debug } = {}) {
  if (scriptHasBridge) {
    console.error('Content script Quasar Bridge has already been created.')
    return
  }

  scriptHasBridge = true
  return new BexBridge({
    type: 'content',
    name: import.meta.env.QUASAR_BEX_SCRIPT_NAME,
    debug
  })
}
