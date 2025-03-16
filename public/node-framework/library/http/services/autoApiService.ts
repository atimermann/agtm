/**
 * Created on 24/02/2025
 *
 * @author André Timermann <andre@timermann.com.br>
 *
 * @file
 * Responsável automatizar os controllers, gerando as consultas ao banco de dados automaticamente de acordo com o
 *  AutoSchema
 *
 */
import LoggerService from "#/services/loggerService.ts"
import type AutoSchema from "../autoSchema.ts"
import type { FieldSchemaInterface } from "../interfaces/autoSchema/fieldsSchema.interface.ts"

import { join, resolve } from "node:path"
import AutoSchemaService from "#/http/services/autoSchemaService.js"

export class AutoApiService {
  private logger: LoggerService
  private prismaInstance?: Record<string, any>
  private readonly autoSchema: AutoSchema

  /**
   * Gera nova instancia à partir do schema
   */
  static async createFromSchema(logger: LoggerService, autoSchema: AutoSchema): Promise<AutoApiService> {
    const autoApi = new AutoApiService(logger, autoSchema)
    autoApi.prismaInstance = await autoApi.importPrismaClient()
    return autoApi
  }

  /**
   * Gera nova instancia à partir do arquivo do schema
   */
  static async createFromSchemaFile(schemaFilePath: string): Promise<AutoApiService> {
    const logger = new LoggerService()
    const autoSchemaService = new AutoSchemaService(logger)

    // Se o caminho começa com "/", usa diretamente como absoluto.
    // Caso contrário, resolve relativo ao diretório atual.
    const finalPath = schemaFilePath.startsWith("/") ? schemaFilePath : resolve(process.cwd(), schemaFilePath)

    const autoSchema = await autoSchemaService.createAutoSchemaFromFile({
      path: finalPath,
    })

    const autoApi = new AutoApiService(logger, autoSchema)
    autoApi.prismaInstance = await autoApi.importPrismaClient()

    return autoApi
  }

  constructor(logger: LoggerService, autoSchema: AutoSchema) {
    this.autoSchema = autoSchema
    this.logger = logger
  }

  /**
   * Retorna instancia do prisma com a entidade definida
   */
  get prisma() {
    return this.prismaInstance ? this.prismaInstance[this.autoSchema.model] : null
  }

  async create(rawData: unknown) {
    const data = await this.loadDataFromBody(true, rawData)

    this.logger.debug(`Create "${this.autoSchema.model}":\n "${JSON.stringify(data, undefined, "  ")}"`)

    const queryResult = await this.prisma.create({ data })
    return this.filterResult(queryResult)
  }

  async getAll() {
    const queryResult = await this.prisma.findMany({
      select: this.autoSchema.generateSelectField(),
      where: { deletedAt: null },
    })

    return this.filterResult(queryResult)
  }

  async get(id: number) {
    return await this.prisma.findFirst({
      select: this.autoSchema.generateSelectField(),
      where: { id, deletedAt: null },
    })
  }

  async update(id: number, rawData: unknown) {
    const data = await this.loadDataFromBody(false, rawData)

    const queryResult = await this.prisma.update({
      data: {
        ...data,
        updatedAt: new Date(),
      },
      where: { id, deletedAt: null },
    })

    return this.filterResult(queryResult)
  }

  async delete(id: unknown) {
    const queryResult = await this.prisma.update({
      where: { id, deletedAt: null },
      data: { deletedAt: new Date() },
    })

    return this.filterResult(queryResult)
  }

  async getCrudSchema() {
    return this.autoSchema.mapApiSchemaToCrudSchema()
  }

  /**
   * Importa PrismaClient do diretório do projeto do usuário
   *
   */
  private async importPrismaClient() {
    const pathToPrismaClient = join(process.cwd(), "node_modules", "@prisma/client")
    const PrismaClient = (await import(`${pathToPrismaClient}/default.js`)).PrismaClient
    const prisma = new PrismaClient({
      log: ["query", "info", "warn", "error"],
    })

    prisma.$on("query", (event) => {
      this.logger.info("[PRISMA QUERY]:", event.query, event.params)
    })

    return prisma
  }

  /**
   * Filtra o resultado de uma query para retornar apenas os campos visíveis (view = true).
   * Usado apenas no DELETE, UPDATE e CREATE, já que o get e getAll é possível definir o select.
   *
   * @param queryResult Resultado da query filtrado. Pode ser um objeto ou um array de objetos.
   * @returns Objeto filtrado ou array de objetos filtrados.
   */
  private filterResult(
    queryResult: Record<string, unknown> | Record<string, unknown>[],
  ): Record<string, unknown> | Record<string, unknown>[] {
    if (Array.isArray(queryResult)) {
      return queryResult.map((item) => this.filterResult(item) as Record<string, unknown>)
    }

    return Object.fromEntries(
      Object.entries(queryResult).filter(([key]) => {
        return this.autoSchema.getViewFields().includes(key)
      }),
    )
  }

  /**
   * Extrai dados do request.body
   *
   * @param isCreate  Define se a operação é de criação
   * @param body      Corpo da requisição
   */
  private async loadDataFromBody(isCreate: boolean, body: any) {
    const data: Record<string, any> = {}

    for (const field of this.autoSchema.fields) {
      // Ignora campos create ou update
      if (isCreate && field.create === false) continue
      if (!isCreate && field.update === false) continue

      const value = body[field.name]

      this.validateRequired(isCreate, field, value)

      if (value === undefined) continue

      await this.validateUnique(field, value)

      /**
       * Tratamento relation N-1:
       * TODO Separar nova função
       * REF: https://www.prisma.io/docs/orm/prisma-schema/data-model/relations#associate-an-existing-record-to-another-existing-record
       */
      if (field.relation) {
        data[field.relation] = {
          connect: {
            id: body[field.name],
          },
        }
        continue
      }

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
  private validateRequired(isCreate: boolean, field: FieldSchemaInterface, value: unknown) {
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
  private async validateUnique(field: FieldSchemaInterface, value: unknown) {
    if (field.unique) {
      // TODO: Validar se o registro já existe
    }
  }
}
