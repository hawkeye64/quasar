import { join } from 'node:path'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { quasar, transformAssetUrls } from '@quasar/vite-plugin'

import singleFile from './build/vite.plugin.single-file.js'

const rootFolder = import.meta.dirname
const resolve = _path => join(rootFolder, _path)

export default defineConfig(() => ({
  plugins: [
    vue({
      template: { transformAssetUrls }
    }),

    quasar({
      sassVariables: '@/quasar.variables.sass',
      autoImportComponentCase: 'pascal'
    }),

    singleFile()
  ],

  resolve: {
    alias: {
      '@': resolve('src')
    }
  },

  build: {
    outDir: 'dist'
  },

  server: {
    open: '/'
  }
}))
