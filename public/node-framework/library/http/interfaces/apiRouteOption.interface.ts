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
export interface CustomContextConfig extends FastifyContextConfig {
  auth?: boolean
  roles?: string[]
  /**
   * Define se a configuração da rota foi gerada automaticamente
   */
  auto?: boolean
}

/**
 * Interface que estende as RouteOptions do Fastify, utilizando a CustomContextConfig para a propriedade 'config'.
 */
export interface ApiRouteOptionInterface extends RouteOptions {
  config?: CustomContextConfig
}
