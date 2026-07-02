import { createPromptSession, fatal, warn } from './logger.js'
import { getExternalNetworkInterface } from './net.js'

export async function getExternalIP() {
  const interfaces = await getExternalNetworkInterface()

  if (interfaces.length === 0) {
    fatal(
      "No external IP detected. Can't run without one. Manually specify one?"
    )
  }

  if (interfaces.length === 1) {
    const address = interfaces[0].address
    warn(`Detected external IP ${address} and using it`)
    return address
  }

  const promptSession = await createPromptSession('Multiple external IPs')
  const { address } = await promptSession.prompt({
    address: () =>
      promptSession.select({
        message: 'Pick External IP:',
        options: interfaces.map(intf => ({
          label: intf.address,
          value: intf.address
        }))
      })
  })
  promptSession.end()

  return address
}
