import { getPackage } from '../utils/get-package.js'

export async function createInstance({ appPaths }) {
  const { default: vueRouterVite } = await getPackage(
    'vue-router/vite',
    appPaths.appDir
  )

  return vueRouterVite
}
