/**
 * **Created on 10/04/2021**
 *
 * index.js
 * @author André Timermann <andre@timermann.com.br>
 *
 */

import { fileURLToPath } from 'node:url'
import { dirname } from 'node:path'
import { readFile } from 'node:fs/promises'
import Multi from './multi.mjs'
import { setTimeout as sleep } from 'node:timers/promises'

/**
 * Old __dirname
 *
 * Example of use:
 *
 * __dirname(import.meta.url)
 *
 * @param importMetaURL
 * @returns {string}
 * @private
 */
export function __dirname (importMetaURL) {
  return dirname(fileURLToPath(importMetaURL))
}

export async function loadJson (path) {
  return JSON.parse(await readFile(path))
}

export async function parseCommand (commandString) {
  // Divida a string do comando em um array usando espaço como delimitador
  const parts = commandString.split(' ')

  // O comando é o primeiro item do array
  const command = parts[0]

  // Os argumentos são todos os itens restantes do array
  const args = parts.slice(1)

  return [command, args]
}

/**
 * Asynchronously generates and returns the current stack trace.
 *
 * This function creates a new Error object, extracts its stack trace,
 * and processes the stack trace to remove the first line (which would
 * indicate this function as the source of the Error).
 *
 * @returns {Promise<String>} A promise that resolves with a string representing the stack trace.
 *
 * @example
 *
 *  import { stacktrace } from '@agtm/util';
 *  console.log(stacktrace());
*/
export async function stacktrace () {
  const stack = new Error().stack
  return stack.split('\n').slice(1).join('\n')
}

/**
 * Calculates and returns the percentage of progress based on defined intervals.
 *
 * @param {number} currentCount - The current count.
 * @param {Array} items - Array of items being processed.
 * @param {number} [step=10] - Interval at which to calculate the percentage.
 * @param {Function} [callback] - Optional callback function to handle the percentage message.
 */
export default function calculateProgressPercentage (currentCount, items, step = 10, callback = undefined) {
  const divisionFactor = Math.floor(items.length / step)
  if (currentCount % divisionFactor === 0) {
    const percentage = (currentCount / items.length) * 100
    callback ? callback(percentage) : console.log(`${percentage}%`)
  }
}

/**
 * Waits for the specified function to return a value other than `undefined`.
 *
 * @async
 * @function
 * @param {Function} fn - The function to check. Should return something other than `undefined` to stop waiting.
 * @param {number} timeout - Maximum time (in ms) to wait before throwing an error.
 * @param {number} [interval=100] - Time interval (in ms) to wait between checks.
 * @returns {Promise<any>} - Returns a Promise that resolves with the value returned by `fn`.
 * @throws {Error} - Throws an error if the time exceeds the specified `timeout`.
 *
 * @deprecated Use import { setTimeout } from 'timers/promises' https://nodejs.org/api/timers.html#timerspromisessettimeoutdelay-value-options
 *
 * @example
 * const testFunction = () => Math.random() > 0.9 ? 'done' : undefined;
 * try {
 *   const result = await wait(testFunction, 1000);
 *   console.log('Function returned:', result);
 * } catch (err) {
 *   console.log('Error:', err.message);
 * }
 */
export async function wait (fn, timeout, interval = 100) {
  const startTime = Date.now()
  let elapsedTime = 0

  let result = await fn()

  while (result === undefined) {
    elapsedTime = Date.now() - startTime

    if (elapsedTime >= timeout) {
      throw new Error('Timeout')
    }

    await sleep(interval)
    result = await fn()
  }

  return result
}

/**
 * Generates a unique identification number based on the current date and a random number
 *
 * @returns {string}
 */
export function generateUniqueIdByDate () {
  return `${Date.now().toString(36)}${Math.random().toString(36).substring(2, 10)}`
}

export {
  Multi,
  /**
   * Creates a delay in the execution of the JavaScript code.
   *
   * @param {number} ms - The amount of time, in milliseconds, to delay the execution of the subsequent code.
   *
   * @returns {Promise} - A Promise that resolves after the specified delay.
   *
   * @example
   * // Print 'Hello', wait for 2 seconds, then print 'World'.
   * console.log('Hello');
   * await sleep(2000);
   * console.log('World');
   */
  sleep
}
