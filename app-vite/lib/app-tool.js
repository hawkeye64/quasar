import { join } from 'node:path'
import fse from 'fs-extra'

import { build as viteBuild } from 'vite'
import { rolldown, watch as rolldownWatch } from 'rolldown'

import { progress } from './utils/logger.js'

const cordovaWWW = join('src-cordova', 'www')
const capacitorWWW = join('src-capacitor', 'www')

export class AppTool {
  argv
  ctx

  constructor({ argv, ctx }) {
    this.argv = argv
    this.ctx = ctx
  }

  async buildWithVite(threadName, viteConfig) {
    const done = progress({
      tool: 'Vite',
      waitAction: 'Compiling',
      doneAction: 'Compiled',
      target: threadName
    })

    await viteBuild(viteConfig)
    done()
  }

  watchWithRolldown(threadName, rolldownConfig, onRebuildSuccess) {
    const { promise, resolve } = Promise.withResolvers()
    const watcher = rolldownWatch({
      ...rolldownConfig,
      watch: {
        exclude: /node_modules/
      }
    })

    let isFirstBuild = true
    let done

    watcher.on('event', event => {
      if (event.code === 'START') {
        done = progress({
          tool: 'Rolldown',
          waitAction: 'Compiling',
          doneAction: 'Compiled',
          target: threadName
        })
      } else if (event.code === 'BUNDLE_END') {
        event.result.close()
        done()

        if (isFirstBuild) {
          isFirstBuild = false
          resolve(watcher)
        } else onRebuildSuccess()
      } else if (event.code === 'ERROR') {
        console.error(event.error)
        event.result.close()
      }
    })

    return promise
  }

  async buildWithRolldown(threadName, rolldownConfig) {
    const done = progress({
      tool: 'Rolldown',
      waitAction: 'Compiling',
      doneAction: 'Compiled',
      target: threadName
    })

    const bundle = await rolldown(rolldownConfig)
    await bundle.write(rolldownConfig.output)
    await bundle.close()

    done()
  }

  cleanArtifacts(dir = this.quasarConf.build.distDir) {
    if (dir.endsWith(cordovaWWW)) {
      fse.emptyDirSync(dir)
    } else if (dir.endsWith(capacitorWWW)) {
      const { appPaths } = this.ctx

      fse.emptyDirSync(dir)
      fse.copySync(
        appPaths.resolve.cli('templates/capacitor/common/www'),
        appPaths.resolve.capacitor('www')
      )
    } else {
      fse.removeSync(dir)
    }
  }
}
