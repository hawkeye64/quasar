import { getPackagePath } from '../../utils/get-package-path.js'
import { getExtensionLogger } from '../logger.js'

export class BaseAPI {
  ctx
  extId
  resolve
  appDir
  logger

  constructor({ ctx, extId }) {
    this.ctx = ctx
    this.extId = extId
    this.resolve = ctx.appPaths.resolve
    this.appDir = ctx.appPaths.appDir
    this.logger = getExtensionLogger(extId)
  }

  /**
   * Is the host project using TypeScript?
   *
   * @return {Promise<boolean>}
   */
  hasTypescript() {
    // implicit async return value
    return this.ctx.cacheProxy.getModule('hasTypescript')
  }

  /**
   * Get the installed and active store package name, if any
   *
   * @return {'pinia' | undefined}
   */
  getStorePackageName() {
    if (getPackagePath('pinia', this.ctx.appPaths.appDir) !== void 0) {
      return 'pinia'
    }
  }

  /**
   * What is the host project's node packager?
   *
   * @return {Promise<'npm' | 'yarn' | 'pnpm' | 'bun'>}
   */
  async getNodePackagerName() {
    const nodePackager = await this.ctx.cacheProxy.getModule('nodePackager')
    return nodePackager.name
  }
}
