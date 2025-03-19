/**
 * Created on 28/02/2025
 *
 * @author
 *   André Timermann <andre@timermann.com.br>
 *
 * @file
 *   Classe abstrata `ApiController` usada para implementar os métodos chamado pela rota que funcionam como o handler
 *   do fastify. Também implementa os controladores padrão do gerador de api automatico
 *
 */
import type { LoggerInterface } from "../loggers/logger.interface.ts"
import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify"
import type AutoSchema from "./autoSchema.ts"
import type { ApiControllerInterface } from "#/http/interfaces/apiController.interface.ts"
import type { PrismaClient } from "@prisma/client"

import { AutoApiService } from "./services/autoApiService.ts"
import { ConfigService } from "#/services/configService.ts"
import { PrismaService } from "#/services/prismaService.js"


interface ParamInterface {
  id: number
}

export class ApiController implements ApiControllerInterface {
  protected autoApiService?: AutoApiService
  protected autoSchema?: AutoSchema

  public __INSTANCE__ = "__ApiController"
  private prisma: PrismaClient

  constructor(
    protected readonly logger: LoggerInterface,
    protected readonly config: ConfigService,
    protected readonly prismaService: PrismaService,
    protected readonly fastify: FastifyInstance,
  ) {}

  /**
   * Configuração inicial do controller (INTERNO: Não deve ser estendido pelo usuário)
   * e chama Setup definido pelo usuário
   */
  async init(autoSchema?: AutoSchema) {
    if (autoSchema) {
      this.autoApiService = new AutoApiService(this.logger, this.prismaService, autoSchema)
    }
    this.autoSchema = autoSchema
    this.prisma = this.prismaService.getInstance()
  }

  /**
   * Méthod de configuração do controller para usuário
   */
  async setup() {}

  /**
   * Controller padrão para criar novo registro
   */
  async create(request: FastifyRequest) {
    if (!this.autoApiService) {
      throw new Error("Invalid controller. It should be used only for automatic routes.")
    }
    // TODO: Validar retorno padrão, usar reply
    return this.autoApiService.create(request.body)
  }

  /**
   * Controller padrão para retornar todos os registros
   *
   **/
  async getAll() {
    if (!this.autoApiService) {
      throw new Error("Invalid controller. It should be used only for automatic routes.")
    }

    return this.autoApiService.getAll()
  }

  /**
   * Controller padrão para retornar um registro baseado no id
   */
  async get(request: FastifyRequest, reply: FastifyReply) {
    if (!this.autoApiService) {
      throw new Error("Invalid controller. It should be used only for automatic routes.")
    }

    // TODO: tipo e entrada por Fastfyschema
    const { id } = request.params as ParamInterface

    const entity = this.autoApiService.get(id)

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
    if (!this.autoApiService) {
      throw new Error("Invalid controller. It should be used only for automatic routes.")
    }
    const { id } = request.params as ParamInterface

    try {
      return this.autoApiService.update(id, request.body)
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
    if (!this.autoApiService) {
      throw new Error("Invalid controller. It should be used only for automatic routes.")
    }
    const { id } = request.params as ParamInterface

    try {
      return this.autoApiService.delete(id)
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
    if (!this.autoApiService) {
      throw new Error("Invalid controller. It should be used only for automatic routes.")
    }
    return this.autoApiService.getCrudSchema()
  }
}
