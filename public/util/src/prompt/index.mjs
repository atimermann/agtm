/**
 * **Created on 02/06/2023**
 *
 * src/prompt/index.mjs
 * @author André Timermann <andre@timermann.com.br>
 *
 */

import { input as inquirerInput, checkbox as inquirerCheckbox, select as inquirerSelect } from '@inquirer/prompts'

/**
 * This method provides a shortcut to create an input prompt using Inquirer.js.
 * Given a question (a string) and an array of default answers, it displays the prompt to the user and returns
 * the user's input as a string.
 *
 * The promise returned by this method is resolved when the user enters a value. The resolved value
 * is the user's input as a string.
 *
 * https://github.com/SBoudrias/Inquirer.js/tree/master/packages/input
 *
 * @example
 *
 * const answer = await input('What is your name?', 'John');
 * console.log(`Hello, ${answer}!`);
 *
 * @param {string} question - The question to display to the user.
 * @param {string} [defaultAnswer=undefined] - The default answer to display in the input field.
 * @param required
 * @returns {Promise<string>} - A Promise that resolves to the user's input as a string.
 */
export async function input (question, defaultAnswer, required = true) {
  return inquirerInput({
    message: question,
    default: defaultAnswer,
    validate: (a) => !(required && !a)
  })
}

/**
 * This method provides a shortcut to create a list (radio-box style) prompt using Inquirer.js.
 * Given a question (a string) and an array of choices, it displays the prompt to the user and returns
 * the index of the user's chosen option in the array.
 *
 * The promise returned by this method is resolved when the user selects an option. The resolved value
 * is the index of the selected option in the provided choices array.
 *
 * https://github.com/SBoudrias/Inquirer.js/tree/master/packages/select
 *
 * @example
 *
 * const index = await select('What is your favorite color?', ['Red', 'Green', 'Blue']);
 * console.log(`You selected option ${index}`);
 *
 * @param {string} question - The question to display to the user.
 * @param {string[]} choices - An array of choices to present to the user.
 * @returns {Promise<number>} - A Promise that resolves to the index of the selected choice in the provided array.
 */
export async function select (question, choices) {
  return inquirerSelect({
    message: question,
    choices: choices.map(c => {
      return { name: c, value: c }
    })
  })
}

/**
 * This method provides a shortcut to create a checkbox-style prompt using Inquirer.js and @inquirer/checkbox.
 * Given a question (a string) and an array of choices, it displays the prompt to the user and returns
 * an array of the user's selected options.
 *
 * The promise returned by this method is resolved when the user selects their options and submits the form.
 * The resolved value is an array of the selected choices.
 *
 * https://github.com/SBoudrias/Inquirer.js/tree/master/packages/checkbox
 *
 * @example
 *
 * const choices = await checkbox('Which colors do you like?', ['Red', 'Green', 'Blue']);
 * console.log(`You selected: ${choices.join(', ')}`);
 *
 * @param {string} question - The question to display to the user.
 * @param {string[]} choices - An array of choices to present to the user.
 * @param {string[]} [checked = []] - An array of choices that should be pre-selected.
 * @param {boolean} [checkedAll = false] - Whether all choices should be pre-selected.
 *
 * @returns {Promise<string[]>} - A Promise that resolves to an array of the selected choices.
 */
export async function checkbox (question, choices, checked = [], checkedAll = false) {
  return inquirerCheckbox({
    message: question,
    choices: choices.map(c => {
      return { name: c, value: c, checked: checkedAll || checked.includes(c) }
    })
  })
}
