import path from 'node:path'

export function quasarRolldownVirtualEntry({ inputFile, targetFile }) {
  const importPath = path
    .relative(path.dirname(inputFile), targetFile)
    .replaceAll('\\', '/')

  const code = `import './${importPath}'`

  return {
    name: 'quasar:virtual-entry',

    resolveId(source) {
      return source === inputFile ? inputFile : null
    },

    load(id) {
      return id === inputFile ? code : null
    }
  }
}
