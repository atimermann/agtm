/**
 * Controller base, gera rota dinamicas
 */

import { AutoCrudService } from "./autoCrudService.js"
import type { FastifyReply, FastifyRequest } from "fastify"
import type { LoggerInterface } from "../loggers/logger.interface.js"
import type { AutoSchemaHandler } from "./autoSchemaHandler.js"

interface ParamInterface {
  id: number
}

export class ApiController {
  private readonly autoSchema: AutoSchemaHandler
  private logger: LoggerInterface
  private autoCrudService: AutoCrudService

  public __INSTANCE__ = "__HttpController"

  constructor(autoSchema: AutoSchemaHandler, logger: LoggerInterface) {
    this.autoSchema = autoSchema
    this.logger = logger
    this.autoCrudService = new AutoCrudService(autoSchema, logger)
  }



  /**
   * Controller padrão para criar novo registro
   */
  async create(request: FastifyRequest) {
    return this.autoCrudService.create(request.body)
  }

  /**
   * Controller padrão para retornar todos os registros
   *
   **/
  async getAll() {
    return this.autoCrudService.getAll()
  }

  /**
   * Controller padrão para retornar um registro baseado no id
   */
  async get(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as ParamInterface

    const entity = this.autoCrudService.get(id)

    // TODO: usar erro padronizado estudar no fastify
    if (!entity) {
      return reply.status(404).send({
        error: "Not Found",
        message: `Route GET:${request.url} not found`,
      })
    }

    return entity
  }

  /**
   * Controller padrão para atualizar registro automaticamente
   **/
  async update(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as ParamInterface

    try {
      return this.autoCrudService.update(id, request.body)
    } catch (error: any) {
      if (error.code === "P2025") {
        // TODO: usar erro padronizado estudar no fastify
        return reply.status(404).send({
          error: "Not Found",
        })
      }

      throw error
    }
  }

  /**
   * Remove registro
   */
  async delete(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as ParamInterface

    try {
      return this.autoCrudService.delete(id)
    } catch (error: any) {
      if (error.code === "P2025") {
        // TODO: usar erro padronizado estudar no fastify
        return reply.status(404).send("Not Found")
      }

      throw error
    }
  }

  /**
   * Gera um CrudSchema usado pelo front end para gerar crud automaticamente
   */
  async schema() {
    return this.autoCrudService.getCrudSchema()
  }
}
