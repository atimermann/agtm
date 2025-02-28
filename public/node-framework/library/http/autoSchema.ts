import ValidatorByInterface from "../utils/validatorByInterface.js"
import type { LoggerInterface } from "../loggers/logger.interface.js"
import type { AutoSchemaInterface } from "./interfaces/autoSchema/autoSchema.interface.ts"
import type { FieldSchemaInterface } from "./interfaces/autoSchema/fieldsSchema.interface.ts"
import type { CrudSchema } from "../http/interfaces/crudSchema.interface.js"
import { sentenceCase } from "change-case"

const autoSchemaValidator = new ValidatorByInterface(
  "library/http/interfaces/autoSchema/autoSchema.interface.ts",
  "AutoSchemaInterface",
)

export default class AutoSchema {
  private schema: AutoSchemaInterface
  private logger: LoggerInterface

  constructor(logger: LoggerInterface, schema: AutoSchemaInterface) {
    this.logger = logger
    autoSchemaValidator.validate(schema)
    this.schema = schema
  }

  /**
   * Nome da Rota
   */
  get routeName(): string {
    return this.schema.route
  }

  /**
   * Retorna nome do model (tabela)
   */
  get model(): string {
    return this.schema.model
  }

  /**
   * Retorna nome da Chave primária
   */
  get key(): string {
    return this.schema.key
  }

  /**
   * Retorna lista de fields (campos)
   */
  get fields(): FieldSchemaInterface[] {
    return this.schema.fields
  }

  /**
   * Retorna lista de campos configurado para ser exibido na view
   *
   * @param key Força retorno do valor da chave primária
   */
  getViewFields(key = true): string[] {
    const viewFields = this.schema.fields
      .filter((field) => field.view !== false)
      .map((field) => field.dbName || field.name)

    if (key) viewFields.push(this.schema.key)
    return viewFields
  }

  /**
   * Returns list of fields configured to return to user
   */
  generateSelectField() {
    const prismaSelectFields: Record<string, any> = {}

    // Chave
    prismaSelectFields[this.schema.key] = true

    for (const field of this.schema.fields) {
      if (field.view === false) continue
      prismaSelectFields[field.dbName || field.name] = true
    }
    return prismaSelectFields
  }

  /**
   * Mapeia o formato padrão Auto SChema para o formato de schema utilizado pelo Crud do Frontend
   * TODO: Converter o método em um mapper
   */
  public mapApiSchemaToCrudSchema(): CrudSchema {
    const crudSchema: CrudSchema = {
      ...this.schema.ui,
      fields: [],
    }

    //////////////////////////////////////////////////
    // Adiciona Chave
    //////////////////////////////////////////////////
    crudSchema.fields.push({
      label: this.schema.key,
      name: this.schema.key,
      ignoreForm: true,
    })

    //////////////////////////////////////////////////
    // MAP FIELDS
    //////////////////////////////////////////////////
    for (const field of this.schema.fields) {
      if (!field.create && !field.update && !field.view) continue

      const crudField = {
        name: field.name,
        label: field.uiProperties?.label || sentenceCase(field.name),
        ignoreGrid: !field.view,
        ignoreForm: !field.create && !field.update,
      }

      crudSchema.fields.push({
        ...crudField,
        ...field.uiProperties,
      })
    }

    return crudSchema
  }

  // /**
  //  * Get the list of fields from the schema.
  //  */
  // public getCreateFieldsName(): string[] {
  //   return this.schema.fields.filter((field) => field.create === true).map((field) => field.name)
  // }
}
