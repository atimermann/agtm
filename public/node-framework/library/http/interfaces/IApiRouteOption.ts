/**
 * Created on 16/03/2025
 *
 * @author
 *   André Timermann <andre@timermann.com.br>
 *
 * @file
 *    Aqui vamos estender o tipo RouteOption usado no fastify para especificar nossas configurações customizada
 *    Usada na geração de rota
 *
 */
import type { RouteOptions, FastifyContextConfig } from "fastify"

/**
 * Interface que estende o FastifyContextConfig para incluir configurações personalizadas,
 * como a propriedade 'auth'. Assim, ela será compatível com a definição original do Fastify.
 */
export interface ICustomContextConfig extends FastifyContextConfig {
  /**
   * Define se a rota deve ser autenticada ou não:
   *    True:       Protegida - será autenticada
   *    False:      Publica   - não será autenticado
   *    undefined:  Publica   - Não será autenticado (Usado em rotas padrões como /ping /docs do swagger)
   *    null:       Erro      - Força um erro que usuário precisa decidir (obriga decisão do usuário)
   */
  auth?: boolean | null
  roles?: string[]
  /**
   * Define se a configuração da rota foi gerada automaticamente
   */
  auto?: boolean
}

/**
 * Interface que estende as RouteOptions do Fastify, utilizando a ICustomContextConfig para a propriedade 'config'.
 */
export interface IApiRouteOption extends RouteOptions {
  config?: ICustomContextConfig
}
