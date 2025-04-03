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
import type { FastifyInstance, FastifyReply, FastifyRequest, RouteHandler } from "fastify"
import type { AutoSchema } from "./autoSchema.ts"
import type { PrismaClient } from "@prisma/client"

import type { ConfigService } from "#/services/configService.ts"
import type { PrismaService } from "#/services/prismaService.js"
import type { AutoApi } from "#/http/autoApi.ts"

interface ParamInterface {
  id: number
}

export class ApiController {
  public __INSTANCE__ = "__ApiController"
  /**
   * Nome
   *
   * @private
   */
  constructor(
    protected readonly logger: LoggerInterface,
    protected readonly config: ConfigService,
    protected readonly prismaService: PrismaService,
    protected readonly prisma: PrismaClient,
    protected readonly fastify: FastifyInstance,
    protected readonly appName: string,
    protected readonly autoSchema?: AutoSchema,
    protected readonly autoApi?: AutoApi,
  ) {}

  /**
   * Méthod de configuração do controller para usuário
   */
  async setup() {}

  /**
   * Controller padrão para criar novo registro
   */
  async create(request: FastifyRequest, reply: FastifyReply) {
    if (!this.autoApi) {
      throw new Error("Invalid controller. It should be used only for automatic routes.")
    }
    // TODO: Validar retorno padrão, usar reply
    return this.autoApi.create(request.body)
  }

  /**
   * Controller padrão para retornar todos os registros
   *
   **/
  async getAll(request: FastifyRequest, reply: FastifyReply) {
    if (!this.autoApi) {
      throw new Error("Invalid controller. It should be used only for automatic routes.")
    }

    return this.autoApi.getAll()
  }

  /**
   * Controller padrão para retornar um registro baseado no id
   */
  async get(request: FastifyRequest, reply: FastifyReply) {
    if (!this.autoApi) {
      throw new Error("Invalid controller. It should be used only for automatic routes.")
    }

    // TODO: tipo e entrada por Fastfyschema
    const { id } = request.params as ParamInterface

    const entity = this.autoApi.get(id)

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
    if (!this.autoApi) {
      throw new Error("Invalid controller. It should be used only for automatic routes.")
    }
    const { id } = request.params as ParamInterface

    try {
      return this.autoApi.update(id, request.body)
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
    if (!this.autoApi) {
      throw new Error("Invalid controller. It should be used only for automatic routes.")
    }
    const { id } = request.params as ParamInterface

    try {
      return this.autoApi.delete(id)
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
  async schema(request: FastifyRequest, reply: FastifyReply) {
    if (!this.autoApi) {
      throw new Error("Invalid controller. It should be used only for automatic routes.")
    }
    return this.autoApi.getCrudSchema()
  }

  /**
   * Representa qualquer outro método criado pelo usuário
   */
  [key: string]: RouteHandler | any
}
