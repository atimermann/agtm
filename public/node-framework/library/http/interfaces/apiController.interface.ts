import type { LoggerInterface } from "#/loggers/logger.interface.ts"
import type { FastifyReply, FastifyRequest } from "fastify"

/**
 * Interface para a classe `ApiController`
 */
export interface ApiControllerInterface {
  /**
   * Identificador da instância do controlador.
   */
  __INSTANCE__: string


  // TODO: IDE ainda não identifica get e outros métodos nas definições filhas do controller
  get: (request: FastifyRequest, reply: FastifyReply) => Promise<any>
}
