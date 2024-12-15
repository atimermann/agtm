import type { AutoSchema, FieldSchema } from "./autoSchema.interface.ts"
import type { UserClassFileDescription } from "./httpServer2.ts"
import { sentenceCase } from "change-case"
import type { CrudSchema } from "./crudSchema.interface.js"

export class AutoSchemaHandler {
  readonly schema: AutoSchema

  static async createFromFile(fileDescription: UserClassFileDescription) {
    const autoSchema = await this.loadSchema(fileDescription)
    return new AutoSchemaHandler(autoSchema)
  }

  protected static async loadSchema(
    fileDescription: UserClassFileDescription,
  ): Promise<AutoSchema> {
    const schema = {
      fields: [],
      ...(await import(fileDescription.path, { with: { type: "json" } })).default,
    }

    schema.fields = schema.fields.map((schemaElement: FieldSchema) => ({
      create: true,
      update: true,
      view: true,
      properties: {},
      ...schemaElement,
    }))
    return schema
  }

  constructor(schema: AutoSchema) {
    this.schema = schema
  }

  /**
   * Get the list of fields from the schema.
   */
  public getCreateFieldsName(): string[] {
    return this.schema.fields.filter((field) => field.create === true).map((field) => field.name)
  }

  /**
   * Returns list of fields configured to return to user
   */
  public generateSelectField() {
    const prismaSelectFields = {}

    // Chave
    prismaSelectFields[this.schema.key] = true

    for (const field of this.schema.fields) {
      if (field.view === false) continue
      prismaSelectFields[field.dbName || field.name] = true
    }
    return prismaSelectFields
  }

  /**
   * Retorna lista de campos configurado para ser exibido na view
   *
   * @param key Força retorno do valor da chave primária
   */
  public getViewFields(key = true): string[] {
    const viewFields = this.schema.fields
      .filter((field) => field.view !== false)
      .map((field) => field.dbName || field.name)

    if (key) viewFields.push(this.schema.key)
    return viewFields
  }

  /**
   * Mapeia o formato padrão Auto SChema para o formato de schema utilizado pelo Crud do Frontend
   * TODO: Conerter o método em um mapper
   */
  public mapAutoSchemaToCrudSchema(): CrudSchema {
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
        label: field.properties.label || sentenceCase(field.name),
        ignoreGrid: !field.view,
        ignoreForm: !field.create && !field.update,
      }

      crudSchema.fields.push({
        ...crudField,
        ...field.properties,
      })
    }

    return crudSchema
  }
}
