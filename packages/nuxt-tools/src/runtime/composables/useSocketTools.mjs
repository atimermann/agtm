/**
 * **Created on 15/10/23**
 *
 * src/composables/tools
 * @author André Timermann <andre@timermann.com.br>
 *
 */

import { useNuxtTools } from '#imports'

const { getEnvConfig } = useNuxtTools

export default {

  /**
   * Realiza conexão ao servidor socket usando variaveis de ambiente padrãẽs:
   *  NUXT_PUBLIC_SOCKET_HOSTNAME : Hostname do servidor (se null conecta na URL da página)
   *  NUXT_PUBLIC_SOCKET_PORT       Porta do servidor (se null conecta porta do servidor)
   *
   * @param io  IO
   * @param {string} path
   * @param options SocketOptions REf: https://socket.io/docs/v4/client-options/
   * @returns {*}
   */
  connect (io, path, options) {
    const socketHttps = getEnvConfig('socketHttps')
    const socketHostname = getEnvConfig('socketHostname')
    const socketPort = getEnvConfig('socketPort')

    return io(`${socketHttps ? 'https' : 'http'}://${socketHostname}${socketPort ? `:${socketPort}` : ''}${path}`, options)
  }

}
