/**
 * **Created on 15/10/23**
 *
 * src/composables/tools
 * @author André Timermann <andre@timermann.com.br>
 *
 */

import { useRuntimeConfig } from '#imports'

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
  }
}
