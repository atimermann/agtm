import type { LoggerInterface } from "#/loggers/logger.interface.ts"

/**
 * Interface para a classe `ApiController`
 */
export interface ApiControllerInterface {
  /**
   * Identificador da instância do controlador.
   */
  __INSTANCE__: string

  /**
   * Logger utilizado pelo controlador.
   */
  readonly logger: LoggerInterface
}
