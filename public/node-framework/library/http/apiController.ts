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
import type { ApiAuto } from "#/http/apiAuto.ts"

export interface ParamInterface {
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
    protected readonly autoApi?: ApiAuto,
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

    const { id } = request.params as ParamInterface
    return this.autoApi.get(id)
  }

  /**
   * Controller padrão para atualizar registro automaticamente
   **/
  async update(request: FastifyRequest, reply: FastifyReply) {
    if (!this.autoApi) {
      throw new Error("Invalid controller. It should be used only for automatic routes.")
    }
    const { id } = request.params as ParamInterface
    return this.autoApi.update(id, request.body)
  }

  /**
   * Remove registro
   */
  async delete(request: FastifyRequest, reply: FastifyReply) {
    if (!this.autoApi) {
      throw new Error("Invalid controller. It should be used only for automatic routes.")
    }
    const { id } = request.params as ParamInterface
    return this.autoApi.delete(id)
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
   * Representa qualquer outro métod0 criado pelo usuário
   */
  [key: string]: RouteHandler | any
}
