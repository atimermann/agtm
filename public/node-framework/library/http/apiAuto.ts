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
import type { PrismaService } from "#/services/prismaService.js"
import type { LoggerService } from "#/services/loggerService.js"
import { ApiError } from "#/http/errors/apiError.js"

export class ApiAuto {
  public __INSTANCE__ = "__ApiAuto"

  constructor(
    protected readonly logger: LoggerService,
    protected readonly autoSchema: AutoSchema,
    protected readonly prismaService: PrismaService,
  ) {}

  async create(rawData: unknown, extraInfo?: unknown) {
    const data = await this.autoSchema.filterInputData(true, rawData)
    const queryResult = await this.prismaModel.create({ data })
    return this.autoSchema.filterOutputData(queryResult)
  }

  /**
   * Retorna todos os registros, não precisa de filterResult, pois selecionados os camos no select
   *
   * @param extraInfo  usado nos filhos
   */
  async getAll(extraInfo?: unknown) {
    return this.prismaModel.findMany({
      select: this.autoSchema.generateSelectField(),
      where: { deletedAt: null },
    })
  }

  async get(id: number, extraInfo?: unknown) {
    const record = await this.prismaModel.findFirst({
      select: this.autoSchema.generateSelectField(),
      where: { id, deletedAt: null },
    })

    if (!record) {
      throw new ApiError(`${this.autoSchema.title} not found for id "${id}"`, "Not Found", 404)
    }

    return record
  }

  async update(id: number, rawData: unknown, extraInfo?: unknown) {
    try {
      const data = await this.autoSchema.filterInputData(false, rawData)

      const queryResult = await this.prismaModel.update({
        data: {
          ...data,
        },
        where: { id, deletedAt: null },
      })

      return this.autoSchema.filterOutputData(queryResult)
    } catch (error: unknown) {
      // @ts-expect-error TS18046: error is of type unknown (Prisma carregado dinamicamente
      if (error instanceof this.prismaService.prisma.PrismaClientKnownRequestError && error.code === "P2025") {
        throw new ApiError(`${this.autoSchema.title} not found for id "${id}"`, "Not Found", 404)
      }

      throw error
    }
  }

  async delete(id: unknown, extraInfo?: unknown) {
    try {
      const queryResult = await this.prismaModel.update({
        where: { id, deletedAt: null },
        data: { deletedAt: new Date() },
      })

      return this.autoSchema.filterOutputData(queryResult)
    } catch (error: unknown) {
      // @ts-expect-error TS18046: error is of type unknown (Prisma carregado dinamicamente
      if (error instanceof this.prismaService.prisma.PrismaClientKnownRequestError && error.code === "P2025") {
        throw new ApiError(`${this.autoSchema.title} not found for id "${id}"`, "Not Found", 404)
      }

      throw error
    }
  }

  async getCrudSchema() {
    return this.autoSchema.mapToCrudSchema()
  }

  /**
   * Retorna instancia do prismaModel com a entidade definida
   */
  get prismaModel() {
    return this.prismaService.getInstance()[this.autoSchema.model]
  }

  // /**
  //  * Filtra o resultado de uma query para retornar apenas os campos visíveis (view = true).
  //  * Usado apenas no DELETE, UPDATE e CREATE, já que o get e getAll é possível definir o select.
  //  *
  //  * @param queryResult Resultado da query filtrado. Pode ser um objeto ou um array de objetos.
  //  *
  //  * @returns Objeto filtrado ou array de objetos filtrados.
  //  */
  // public filterResult(
  //   queryResult: Record<string, unknown> | Record<string, unknown>[],
  // ): Record<string, unknown> | Record<string, unknown>[] {
  //   if (Array.isArray(queryResult)) {
  //     return queryResult.map((item) => this.filterResult(item) as Record<string, unknown>)
  //   }
  //
  //   return Object.fromEntries(
  //     Object.entries(queryResult).filter(([key]) => {
  //       return this.autoSchema.getViewFields().includes(key)
  //     }),
  //   )
  // }

  // /**
  //  * Extrai dados do request.body
  //  *
  //  * @param isCreate  Define se a operação é de criação
  //  * @param body      Corpo da requisição
  //  */
  // public async loadDataFromBody(isCreate: boolean, body: any) {
  //   const data: Record<string, any> = {}
  //
  //   for (const field of this.autoSchema.fields) {
  //     // Ignora chave
  //     if (field.name === this.autoSchema.key) continue
  //
  //     // Ignora campos create ou update
  //     if (isCreate && field.create === false) continue
  //     if (!isCreate && field.update === false) continue
  //
  //     const value = body[field.name]
  //     this.validateRequired(isCreate, field, value)
  //
  //     if (value === undefined) continue
  //
  //     // TODO: talvez não seja interessante colocar consultas aqui, pois este método é utilizado externamente, manter o escopo carregar dados do body baseado no schema
  //     await this.validateUnique(field, value)
  //
  //     // TODO: Revisar implementação, talvez não seja interessante deixar consulta aqui pois é usado por outros lugares
  //     // /**
  //     //  * Tratamento relation N-1:
  //     //  * TODO Separar nova função
  //     //  * REF: https://www.prisma.io/docs/orm/prisma-schema/data-model/relations#associate-an-existing-record-to-another-existing-record
  //     //  */
  //     // if (field.relation) {
  //     //   data[field.relation] = {
  //     //     connect: {
  //     //       id: body[field.name],
  //     //     },
  //     //   }
  //     //   continue
  //     // }
  //
  //     data[field.dbName || field.name] = body[field.name]
  //   }
  //
  //   return data
  // }

  // /**
  //  * TODO: Valida se um campo único já existe no banco de dados
  //  *
  //  * @param field Campo a ser validado
  //  * @param value Valor do campo
  //  */
  // protected async validateUnique(field: FieldSchemaInterface, value: unknown) {
  //   if (field.unique) {
  //     // TODO: Validar se o registro já existe
  //   }
  // }
}
