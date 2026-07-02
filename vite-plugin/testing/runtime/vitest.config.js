import { join, normalize } from 'node:path'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

import { quasar, transformAssetUrls } from '../../src/index.js'

const playgroundFolder = normalize(
  join(import.meta.dirname, '../../playground')
)
const resolve = _path => join(playgroundFolder, _path)

export default defineConfig(() => ({
  plugins: [
    vue({
      template: { transformAssetUrls }
    }),

    quasar({
      devTreeshaking: true,
      sassVariables: resolve('src/quasar-variables.sass'),
      autoImportComponentCase: 'combined'
    })
  ],

  resolve: {
    alias: {
      '@': resolve('src')
    }
  },

  test: {
    globals: true,
    environment: 'jsdom',
    environmentOptions: {
      pretendToBeVisual: true
    },
    // browser: {
    //   enabled: true,
    //   headless: true,
    //   name: 'chrome'
    // },
    css: {
      include: [/.+/]
    },
    include: ['./testing/runtime/tests/*.test.{js,ts}'],
    setupFiles: ['./testing/runtime/vitest.setup.js']
  }
}))
