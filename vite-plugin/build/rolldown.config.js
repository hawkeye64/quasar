import { join } from 'node:path'

const resolve = file => join(import.meta.dirname, '..', file)

export default {
  input: resolve('src/index.js'),
  output: {
    file: resolve('dist/index.cjs'),
    format: 'cjs'
  },
  external: ['vite', /quasar[\\/][dist|package.json]/]
}
