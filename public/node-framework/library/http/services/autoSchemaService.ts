/**
 * Created on 26/02/2025
 *
 * @author
 *   André Timermann <andre@timermann.com.br>
 *
 * @file
 *   Classe `AutoSchemaService` responsável por carregar e instanciar
 *   schemas automáticos a partir de arquivos JSON, garantindo a validação
 *   e estrutura correta dos dados.
 *
 */
import type { AutoSchemaInterface } from "../interfaces/autoSchema/autoSchema.interface.ts"
import type { LoggerInterface } from "#/loggers/logger.interface.js"

import { UserClassFileDescription } from "./userApiFilesService.ts"
import AutoSchema from "../autoSchema.ts"

export default class AutoSchemaService {
  private readonly logger: LoggerInterface

  constructor(logger: LoggerInterface) {
    this.logger = logger
  }

  /**
   * Gera uma instancia de AutoSchema à partir de um descritor de arquivo
   *
   * @param fileDescriptor
   */
  async createAutoSchemaFromFile(fileDescriptor: UserClassFileDescription) {
    const schema: AutoSchemaInterface = (
      await import(fileDescriptor.path, { with: { type: "json" } })
    ).default

    try {
      return new AutoSchema(this.logger, schema)
    } catch (error) {
      if (error instanceof TypeError) {
        throw new TypeError(
          `Invalid schema "${fileDescriptor.id}:\n Path: ${fileDescriptor.path}\n ${JSON.stringify(error.cause, undefined, " ")}`,
        )
      }
      throw error
    }
  }
}
