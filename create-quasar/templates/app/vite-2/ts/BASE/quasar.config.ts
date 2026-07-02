// Configuration for your app
// https://legacy-app.quasar.dev/quasar-cli-vite-v2/quasar-config-file

import { defineConfig } from '#q-app/wrappers';
<% if (scope.preset.i18n) { %>
import { join } from 'node:path';
<% } %>

export default defineConfig((<% if (scope.preset.i18n) { %>ctx<% } else { %>/* ctx */<% } %>) => {
  return {
    // https://legacy-app.quasar.dev/quasar-cli-vite-v2/prefetch-feature
    // preFetch: true,

    // app boot file (/src/boot)
    // --> boot files are part of "main.js"
    // https://legacy-app.quasar.dev/quasar-cli-vite-v2/boot-files
    boot: [
<% if (scope.preset.i18n) { %>
      'i18n'
<% } %>
    ],

    // https://legacy-app.quasar.dev/quasar-cli-vite-v2/quasar-config-file#css
    css: [
      'app.<%= scope.preset.sass ? 'scss' : 'css' %>'
    ],

    // https://github.com/quasarframework/quasar/tree/dev/extras
    extras: [
      // 'ionicons-v4',
      // 'mdi-v7',
      // 'fontawesome-v7',
      // 'eva-icons',
      // 'themify',
      // 'line-awesome',
      // 'roboto-font-latin-ext', // this or either 'roboto-font', NEVER both!

      'roboto-font', // optional, you are not bound to it
      'material-icons', // optional, you are not bound to it
    ],

    // https://legacy-app.quasar.dev/quasar-cli-vite-v2/quasar-config-file#build
    build: {
      target: {
        browser: 'baseline-widely-available',
        node: 'node22'
      },

      typescript: {
        strict: true,
        vueShim: true
        // extendTsConfig (tsConfig) {}
      },

      vueRouterMode: 'hash', // available values: 'hash', 'history'
      // vueRouterBase,
      // vueDevtools,
      // vueOptionsAPI: false,

      // publicPath: '/',
      // analyze: true,
      // env: {},
      // rawDefine: {}
      // ignorePublicFolder: true,
      // minify: false,
      // polyfillModulePreload: true,
      // distDir

      // extendViteConf (viteConf) {},
      // viteVuePluginOptions: {},

<% if (scope.preset.i18n || scope.linter === 'eslint') { %>
      vitePlugins: [
<% if (scope.preset.i18n) { %>
        ['@intlify/unplugin-vue-i18n/vite', {
          // if you want to use Vue I18n Legacy API, you need to set `compositionOnly: false`
          // compositionOnly: false,

          // if you want to use named tokens in your Vue I18n messages, such as 'Hello {name}',
          // you need to set `runtimeOnly: false`
          // runtimeOnly: false,

          ssr: ctx.modeName === 'ssr',

          // you need to set i18n resource including paths !
          include: [ join(import.meta.dirname, 'src/i18n') ]
        }]<% if (scope.linter === 'eslint') { %>,<% } %>

<% } %>
<% if (scope.linter === 'eslint') { %>
        ['vite-plugin-checker', {
          vueTsc: true,
          eslint: {
            lintCommand: 'eslint -c ./eslint.config.js "./src*/**/*.{ts,js,mjs,cjs,vue}"',
            useFlatConfig: true
          }
        }, { server: false }]
<% } %>
      ]
<% } else { %>
      // vitePlugins: [
      //   [ 'package-name', { ..pluginOptions.. }, { server: true, client: true } ]
      // ]
<% } %>
    },

    // https://legacy-app.quasar.dev/quasar-cli-vite-v2/quasar-config-file#devserver
    devServer: {
      // https: true,
      open: true // opens browser window automatically
    },

    // https://legacy-app.quasar.dev/quasar-cli-vite-v2/quasar-config-file#framework
    framework: {
      config: {},

      // iconSet: 'material-icons', // Quasar icon set
      // lang: 'en-US', // Quasar language pack

      // For special cases outside of where the auto-import strategy can have an impact
      // (like functional components as one of the examples),
      // you can manually specify Quasar components/directives to be available everywhere:
      //
      // components: [],
      // directives: [],

      // Quasar plugins
      plugins: []
    },

    // animations: 'all', // --- includes all animations
    // https://v2.quasar.dev/options/animations
    animations: [],

    // https://legacy-app.quasar.dev/quasar-cli-vite-v2/quasar-config-file#sourcefiles
    // sourceFiles: {
    //   rootComponent: 'src/App.vue',
    //   router: 'src/router/index',
    //   store: 'src/store/index',
    //   pwaRegisterServiceWorker: 'src-pwa/register-service-worker',
    //   pwaServiceWorker: 'src-pwa/custom-service-worker',
    //   pwaManifestFile: 'src-pwa/manifest.json',
    //   electronMain: 'src-electron/electron-main',
    //   electronPreload: 'src-electron/electron-preload'
    //   bexManifestFile: 'src-bex/manifest.json
    // },

    // https://legacy-app.quasar.dev/quasar-cli-vite-v2/developing-ssr/configuring-ssr
    ssr: {
      prodPort: 3000, // The default port that the production server should use
                      // (gets superseded if process.env.PORT is specified at runtime)

      middlewares: [
        'render' // keep this as last one
      ],

      // extendPackageJson (json) {},
      // extendSSRWebserverConf (esbuildConf) {},

      // manualStoreSerialization: true,
      // manualStoreSsrContextInjection: true,
      // manualStoreHydration: true,
      // manualPostHydrationTrigger: true,

      pwa: false
      // pwaOfflineHtmlFilename: 'offline.html', // do NOT use index.html as name!

      // pwaExtendGenerateSWOptions (cfg) {},
      // pwaExtendInjectManifestOptions (cfg) {}
    },

    // https://legacy-app.quasar.dev/quasar-cli-vite-v2/developing-pwa/configuring-pwa
    pwa: {
      workboxMode: 'GenerateSW' // 'GenerateSW' or 'InjectManifest'
      // swFilename: 'sw.js',
      // manifestFilename: 'manifest.json',
      // extendManifestJson (json) {},
      // useCredentialsForManifestTag: true,
      // injectPwaMetaTags: false,
      // extendPWACustomSWConf (esbuildConf) {},
      // extendGenerateSWOptions (cfg) {},
      // extendInjectManifestOptions (cfg) {}
    },

    // https://legacy-app.quasar.dev/quasar-cli-vite-v2/developing-cordova-apps/configuring-cordova
    cordova: {
      // noIosLegacyBuildFlag: true, // uncomment only if you know what you are doing
    },

    // https://legacy-app.quasar.dev/quasar-cli-vite-v2/developing-capacitor-apps/configuring-capacitor
    capacitor: {
      hideSplashscreen: true
    },

    // https://legacy-app.quasar.dev/quasar-cli-vite-v2/developing-electron-apps/configuring-electron
    electron: {
      // extendElectronMainConf (esbuildConf) {},
      // extendElectronPreloadConf (esbuildConf) {},

      // extendPackageJson (json) {},

      // Electron preload scripts (if any) from /src-electron, WITHOUT file extension
      preloadScripts: [ 'electron-preload' ],

      // specify the debugging port to use for the Electron app when running in development mode
      inspectPort: 5858,

      bundler: 'packager', // 'packager' or 'builder'

      packager: {
        // https://github.com/electron-userland/electron-packager/blob/master/docs/api.md#options

        // OS X / Mac App Store
        // appBundleId: '',
        // appCategoryType: '',
        // osxSign: '',
        // protocol: 'myapp://path',

        // Windows only
        // win32metadata: { ... }
      },

      builder: {
        // https://www.electron.build/configuration

        appId: '<%= scope.name %>'
      }
    },

    // https://legacy-app.quasar.dev/quasar-cli-vite-v2/developing-browser-extensions/configuring-bex
    bex: {
      // extendBexScriptsConf (esbuildConf) {},
      // extendBexManifestJson (json) {},

      /**
       * The list of extra scripts (js/ts) not in your bex manifest that you want to
       * compile and use in your browser extension. Maybe dynamic use them?
       *
       * Each entry in the list should be a relative filename to /src-bex/
       *
       * @example [ 'my-script.ts', 'sub-folder/my-other-script.js' ]
       */
      extraScripts: []
    }
  }
});
