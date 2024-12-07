// TODO: Converte AutoSchema To Fastify Validator Schema (lá no router)
/**
 * Controller usado para criação de rotas auto gereadas dinamicas
 */
import { HttpController } from "./httpController.ts"
import type { FastifyReply, FastifyRequest } from "fastify"
import { join } from "node:path"
import type { LoggerInterface } from "../loggers/logger.interface.ts"
import type { AutoSchemaHandler } from "./autoSchemaHandler.ts"
import type { FieldSchema } from "./autoSchema.interface.ts"

interface ParamInterface {
  id: string
}

type Dict = { [key: string]: unknown }

export default class DynamicController extends HttpController {
  private readonly autoSchema: AutoSchemaHandler
  private logger: LoggerInterface
  private prismaIntance: any

  /**
   *  Contructor
   *
   * @param autoSchema Gerenciador do Auto schema
   * @param logger Instância do logger
   */
  constructor(autoSchema: AutoSchemaHandler, logger: LoggerInterface) {
    super()
    this.autoSchema = autoSchema
    this.logger = logger
  }

  /**
   * Configuração inicial do controller
   */
  async setup() {
    this.prismaIntance = await this.importPrismaClient()
  }

  /**
   * Retorna instancia do prisma com a entidade definida
   */
  get prisma() {
    return this.prismaIntance[this.autoSchema.schema.model]
  }

  /**
   * Controller padrão para criar novo registro
   *
   * @param request
   */
  async dynamicCreate(request: FastifyRequest) {
    const data = await this.loadDataFromBody(true, request.body)
    const queryResult = await this.prisma.create({ data })
    return this.filterResult(queryResult)
  }

  /**
   * Controller padrão para retornar todos os registros
   *
   **/
  async dynamicGetAll() {
    const modelName = this.autoSchema.schema.model
    return this.prismaIntance[modelName].findMany({
      select: this.autoSchema.generateSelectField(),
      where: { deletedAt: null },
    })
  }

  /**
   * Controller padrão para retornar um registro baseado no id
   *
   * @param request
   * @param reply
   */
  async dynamicGet(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as ParamInterface

    const entity = await this.prisma.findFirst({
      select: this.autoSchema.generateSelectField(),
      where: { id: parseInt(id), deletedAt: null },
    })

    // TODO: usar erro padronizado estudar no fastify
    if (!entity) {
      return reply.status(404).send({
        error: "Not Found",
      })
    }

    return entity
  }

  /**
   * Controller padrão para atualizar registro automaticamente
   *
   * @param request
   * @param reply
   **/
  async dynamicUpdate(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as ParamInterface
    const data = await this.loadDataFromBody(false, request.body)

    try {
      const queryResult = await this.prisma.update({
        data: {
          ...data,
          updatedAt: new Date(),
        },
        where: { id: parseInt(id), deletedAt: null },
      })

      return this.filterResult(queryResult)
    } catch (error) {
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
   *
   * @param request
   * @param reply
   */
  async dynamicDelete(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as ParamInterface

    try {
      const queryResult = await this.prisma.update({
        where: { id: parseInt(id), deletedAt: null },
        data: { deletedAt: new Date() },
      })

      return this.filterResult(queryResult)
    } catch (error) {
      if (error.code === "P2025") {
        // TODO: usar erro padronizado estudar no fastify
        return reply.status(404).send("Not Found")
      }

      throw error
    }
  }

  /**
   * TODO: Gera um schema para ser usado pelo frontend para gerar crud automaticamente
   *
   * @param request
   * @param reply
   */
  async dynamicSchema(request: FastifyRequest, reply: FastifyReply) {}

  /**
   * Importa PrismaClient do diretório do projeto do usuário
   *
   */
  private async importPrismaClient() {
    const pathToPrismaClient = join(process.cwd(), "node_modules", "@prisma/client")
    const PrismaClient = (await import(`${pathToPrismaClient}/default.js`)).PrismaClient
    return new PrismaClient()
  }

  /**
   * Extrai dados do request.body
   *
   * @param isCreate  Define se a operação é de criação
   * @param body      Corpo da requisição
   */
  private async loadDataFromBody(isCreate: boolean, body: unknown) {
    const data = {}

    for (const field of this.autoSchema.schema.fields) {
      // Ignora campos create ou update
      if (isCreate && field.create === false) continue
      if (!isCreate && field.update === false) continue

      const value = body[field.name]

      this.validateRequired(isCreate, field, value)

      if (value === undefined) continue

      await this.validateUnique(field, value)

      data[field.dbName || field.name] = body[field.name]
    }

    return data
  }

  /**
   *  Validação de campos obrigatório para a base de dados
   *  Se undefined no modo update o campo será ignorado então ok
   *  Null sempre valida
   *
   *  NOTA: Gera apenas validações simples
   *
   * @param isCreate  Define se a operação é de criação
   * @param field     Campo a ser validado
   * @param value     Valor do campo
   */
  private validateRequired(isCreate: boolean, field: FieldSchema, value: unknown) {
    // TODO: Tentar usar um gerador de erro padrão, para retornar no padrão do fastify (ou criar se nao existir)
    if (field.required && isCreate && (value === undefined || value === null)) {
      throw new Error(`The "${field.name}" field is required.`)
    }

    if (field.required && !isCreate && value === null) {
      throw new Error(`The "${field.name}" field is required.`)
    }
  }

  /**
   * TODO: Valida se um campo único já existe no banco de dados
   *
   * @param field Campo a ser validado
   * @param value Valor do campo
   */
  private async validateUnique(field: FieldSchema, value: unknown) {
    if (field.unique) {
      // TODO: Validar se o registro já existe
    }
  }

  /**
   * Filtra o resultado de uma query para retornar apenas os campos visíveis (view = true)
   *
   * @param queryResult Resultado da query filtrado
   */
  private filterResult(queryResult: Dict) {
    return Object.fromEntries(
      Object.entries(queryResult).filter(([key]) => {
        return this.autoSchema.getViewFields().includes(key)
      }),
    )
  }
}
