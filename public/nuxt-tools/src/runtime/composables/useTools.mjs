/**
 * **Created on 15/10/23**
 *
 * src/composables/tools
 * @author André Timermann <andre@timermann.com.br>
 *
 */

import { useRuntimeConfig } from '#imports'
import { addSeconds, differenceInSeconds, formatDistance } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export default {
  /**
   * Loads a public attribute defined with runtimeconfig and defined with an environment variable, validating whether it was defined
   *
   * @param {string} attributeName  Nome do atributo a ser carregado e validado
   * @param {boolean }required      Se é requerido
   * @returns {Promise<void>}
   *
   */
  getEnvConfig (attributeName, required = true) {
    const config = useRuntimeConfig()

    const envConfig = config.public[attributeName]

    // TODO: Erro mesmo quando definido, verificar se tá sendo passado false ou oq
    // alert(`${attributeName} => ${envConfig}`)
    // if (!envConfig && envConfig !== false && required) {
    // // eslint-disable-next-line no-undef
    //   throw showError({
    //     statusCode: 500,
    //     statusMessage: `Environment variable "NUXT_PUBLIC_${useSnakeCase(attributeName).toUpperCase()}" not defined in env file.`
    //   })
    // }

    return envConfig
  },

  // TODO: Criar método que busca e define atributo numa coleção reativa(Array) do vue3

  /**
   * Calculates the Estimated Time of Arrival (ETA) to reach 100% progress.
   *
   * @param {Date|string} startAt - The starting date/time of the process. Accepts a JavaScript Date object or a string that can be parsed into a Date.
   * @param {number} progress - The current progress percentage, must be between 0 and 100 (exclusive).
   *
   * @returns {string|null} - The human-readable estimated time remaining to reach 100% progress.
   * @throws {Error} - Throws an error if the progress is not between 0 and 100 (exclusive).
   */
  calculateEta (startAt, progress) {
    if (progress <= 0 || progress >= 100) {
      return null
    }

    const startDate = typeof startAt === 'string'
      ? new Date(startAt)
      : startAt

    const elapsedSeconds = differenceInSeconds(new Date(), startDate)
    const totalSeconds = (elapsedSeconds * 100) / progress
    const endDate = addSeconds(startDate, totalSeconds)

    return formatDistance(new Date(), endDate, { locale: ptBR, includeSeconds: true })
  },

  /**
   * Encrypts a given text using a specified hashing algorithm.
   *
   * @async
   * @function
   * @param {string} text - The text to be encrypted.
   * @param {string} [algorithm='SHA-256'] - The hashing algorithm to be used. Defaults to 'SHA-256'.
   * @returns {Promise<string>} The encrypted text as a hexadecimal string.
   * @throws Will throw an error if the hashing algorithm is not supported.
   *
   * @example
   * const encryptedText = await encryptText('hello');
   * console.log(encryptedText);  // Outputs the encrypted text in hexadecimal format.
   */
  async encryptText (text, algorithm = 'SHA-256') {

    // TODO: Só funciona com HTTPS, navegador bloquena crypto.subtle com http, retorna undefinet
    // TODO: Criar um teste geral para evitar surpresas
    const encoder = new TextEncoder()
    const data = encoder.encode(text)
    const hashBuffer = await crypto.subtle.digest(algorithm, data)
    const hashArray = Array.from(new Uint8Array(hashBuffer)) // convert buffer to byte array
    // convert bytes to hex string
    return hashArray
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('')
  }

}
