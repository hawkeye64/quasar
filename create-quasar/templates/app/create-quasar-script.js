export async function createQuasarScript({ scope, utils }) {
  await utils.promptUser(scope, {
    engine: () =>
      utils.prompts.select({
        message: 'Pick Quasar App CLI variant:',
        initialValue: utils.definitions.engine.default,
        options: [
          {
            label: '@quasar/app-vite v3 RC (recommended)',
            value: 'vite-3'
          },
          {
            label: '@quasar/app-vite v2',
            value: 'vite-2',
            hint: 'deprecated'
          }
        ]
      }),

    name: () => {
      const defaultName = utils.definitions.name.default(
        scope.projectFolderName
      )

      return utils.prompts.text({
        message: 'Package name:',
        placeholder: defaultName,
        defaultValue: defaultName,
        validate: val => {
          if (!utils.definitions.name.isValid(val)) {
            return 'Invalid package.json name'
          }
        }
      })
    },

    product: () =>
      utils.prompts.text({
        message:
          'Project product name: (must start with letter if building mobile apps)',
        placeholder: utils.definitions.product.default,
        defaultValue: utils.definitions.product.default
      })
  })

  const { createQuasarScript: create } = await import(
    `./${scope.engine}/create-quasar-script.js`
  )
  await create({ scope, utils })

  scope.meta.runDevCmd = 'quasar dev'
}
