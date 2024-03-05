/**
 * Defines a global logging function `log` to facilitate debugging during development.
 * The `log` function is globally available as part of the `window` object and can be used
 * to print formatted JSON objects to the console. This plugin is activated only in the
 * development environment, aiding the development process without affecting production.
 *
 * **Created on: 05/03/24**
 *
 * @file This Nuxt plugin adds a custom log function to the `window` object for use during development.
 * It simplifies viewing JavaScript objects by formatting them with spacing for better readability in the console.
 *
 * Usage:
 * ```
 * log({ myKey: "myValue" });
 * ```
 * @author André Timermann <andre@timermann.com.br>
 */
import { defineNuxtPlugin } from '#app'
import { toRaw } from 'vue'
export default defineNuxtPlugin(() => {
  if (import.meta.env.DEV) {
    window.log = (obj) => {
      console.log(toRaw(obj))
    }
  }
})
