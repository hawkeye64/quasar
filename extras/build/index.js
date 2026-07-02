import { cpus } from 'node:os'
import { fork } from 'node:child_process'
import { join } from 'node:path'

import { Queue, retry, sleep } from './utils.js'
import { generateReadme } from './readme.js'

const startTime = Date.now() // Add timing start

const cpuCount = cpus().length
const isParallel = cpuCount > 1
const maxJobCount = Math.max(cpuCount * 2 - 1, 1)
const runScript = isParallel
  ? (file, args, opts) => fork(file, args, opts)
  : file => import(file)

const materialFontVersions = {}

function collectFontVersions(text) {
  text.split('\n').forEach(line => {
    const versionMatch = line.match(/^QEXTRA_VERSION::([^:]+)::(v[^:\s]+)$/)

    if (versionMatch) {
      const [, name, version] = versionMatch
      materialFontVersions[name] = version
    }
  })
}

function handleChild(child) {
  return new Promise((resolve, reject) => {
    child.on('error', reject)
    child.on('exit', code => {
      if (code === 0) {
        resolve()
        return
      }

      reject(new Error(`Child exited with code ${code}`))
    })

    if (child.stdout) {
      child.stdout.on('data', data => {
        const output = data.toString()
        if (!output.startsWith('.')) {
          console.log(output)
        }

        collectFontVersions(output)
      })
    }

    if (child.stderr) {
      child.stderr.on('data', data => {
        const errorOutput = data.toString()
        if (!errorOutput.startsWith('.')) {
          console.error(errorOutput)
        }

        collectFontVersions(errorOutput)
      })
    }
  })
}

async function runJob(queue, scriptFile) {
  if (isParallel) {
    queue.push(scriptFile)
  } else {
    await runScript(join(import.meta.dirname, scriptFile))
  }
}

const queue = new Queue(
  async scriptFile => {
    await retry(async ({ tries }) => {
      await sleep((tries - 1) * 100)
      const child = await runScript(join(import.meta.dirname, scriptFile), [], {
        silent: true
      })
      await handleChild(child)
    })
  },
  { concurrency: maxJobCount }
)

const jobs = [
  './webfonts.js',
  './animate.js',
  './mdi-v7.js',
  './fontawesome-v7.js',
  './ionicons-v8.js',
  './eva-icons.js',
  './themify.js',
  './line-awesome.js',
  './bootstrap-icons.js',
  // './material-icons.js', // hasn't updated in 2 years
  './material-symbols.js',
  './package-json.js'
]

for (const scriptFile of jobs) {
  await runJob(queue, scriptFile)
  if (
    [
      // './material-icons.js', // hasn't updated in 2 years
      './material-symbols.js',
      './package-json.js'
    ].includes(scriptFile)
  ) {
    await queue.wait({ empty: true })
  }
}

if (Object.keys(materialFontVersions).length !== 0) {
  generateReadme({ googleVersions: materialFontVersions })
  console.log(JSON.stringify(materialFontVersions, null, 2))
}

// Add timing end and display duration
const endTime = Date.now()
const duration = endTime - startTime
console.log(`\nTotal execution time: ${duration}ms`)
