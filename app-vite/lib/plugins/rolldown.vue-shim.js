/**
 * There are some use-cases where user imports a Vue file
 * even if this is a UI file requested in a Node context.
 */
export function quasarRolldownVueShimPlugin() {
  return {
    name: 'quasar:vue-shim',

    load(id) {
      if (!id.endsWith('.vue')) return null

      return {
        code: '',
        map: { mappings: '' }
      }
    }
  }
}
