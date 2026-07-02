/**
 * Quasar App Extension prompts script
 * https://quasar.dev/app-extensions/development-guide/prompts-api
 */

import { definePromptsScript } from '#q-app'
import { intro, outro, text, select, group, cancel } from '@clack/prompts'

export default definePromptsScript(async (/* api */) => {
  intro('Serious questions ahead!')

  const answers = await group(
    {
      name: () => text({ message: 'What is your name?' }),
      color: ({ results }) =>
        select({
          message: `What is your favorite color, ${results.name}?`,
          options: [
            { value: 'red', label: 'Red' },
            { value: 'green', label: 'Green' },
            { value: 'blue', label: 'Blue' }
          ]
        })
    },
    {
      // On Cancel callback that wraps the group
      // So if the user cancels one of the prompts in the group this function will be called
      onCancel: (/* { results } */) => {
        cancel('Operation cancelled.')
        process.exit(0)
      }
    }
  )

  outro('Thanks for answering the questions!')

  return answers
})
