/**
 * **Created on 30/03/2025**
 *
 * @author André Timermann <andre@timermann.com.br>
 *
 * @file
 *  Auto Api para ser customizado
 *
 */
import type { AutoSchema } from "#/http/autoSchema.js"
import type { FieldSchemaInterface } from "#/http/interfaces/schemas/autoSchema/fieldsSchema.interface.js"
import type { PrismaService } from "#/services/prismaService.js"
import type { LoggerService } from "#/services/loggerService.js"

export class ApiAuto {
  public __INSTANCE__ = "__ApiAuto"

  constructor(
    protected readonly logger: LoggerService,
    protected readonly autoSchema: AutoSchema,
    protected readonly prismaService: PrismaService,
  ) {}

  async create(rawData: unknown) {
    const data = await this.loadDataFromBody(true, rawData)
    const queryResult = await this.prismaModel.create({ data })
    return this.filterResult(queryResult)
  }

  async getAll() {
    const queryResult = await this.prismaModel.findMany({
      select: this.autoSchema.generateSelectField(),
      where: { deletedAt: null },
    })
    return this.filterResult(queryResult)
  }

  async get(id: number) {
    return await this.prismaModel.findFirst({
      select: this.autoSchema.generateSelectField(),
      where: { id, deletedAt: null },
    })
  }

  async update(id: number, rawData: unknown) {
    const data = await this.loadDataFromBody(false, rawData)

    const queryResult = await this.prismaModel.update({
      data: {
        ...data,
        updatedAt: new Date(),
      },
      where: { id, deletedAt: null },
    })

    return this.filterResult(queryResult)
  }

  async delete(id: unknown) {
    const queryResult = await this.prismaModel.update({
      where: { id, deletedAt: null },
      data: { deletedAt: new Date() },
    })

    return this.filterResult(queryResult)
  }

  async getCrudSchema() {
    return this.autoSchema.mapApiSchemaToCrudSchema()
  }

  /**
   * Retorna instancia do prismaModel com a entidade definida
   */
  get prismaModel() {
    return this.prismaService.getInstance()[this.autoSchema.model]
  }

  /**
   * Filtra o resultado de uma query para retornar apenas os campos visíveis (view = true).
   * Usado apenas no DELETE, UPDATE e CREATE, já que o get e getAll é possível definir o select.
   *
   * @param queryResult Resultado da query filtrado. Pode ser um objeto ou um array de objetos.
   * @returns Objeto filtrado ou array de objetos filtrados.
   */
  protected filterResult(
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
  protected async loadDataFromBody(isCreate: boolean, body: any) {
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
  protected validateRequired(isCreate: boolean, field: FieldSchemaInterface, value: unknown) {
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
  protected async validateUnique(field: FieldSchemaInterface, value: unknown) {
    if (field.unique) {
      // TODO: Validar se o registro já existe
    }
  }
}
