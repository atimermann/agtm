import type { AutoSchema, FieldSchema } from "./autoSchema.interface.ts"
import type { UserClassFileDescription } from "./httpServer2.ts"

export class AutoSchemaHandler {
  readonly schema: AutoSchema

  static async createFromFile(fileDescription: UserClassFileDescription) {
    const autoSchema = await this.loadSchema(fileDescription)
    return new AutoSchemaHandler(autoSchema)
  }

  protected static async loadSchema(fileDescription: UserClassFileDescription): Promise<AutoSchema> {
    return (await import(fileDescription.path, { with: { type: "json" } })).default
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
    for (const field of this.schema.fields) {
      if (field.view === false) continue
      prismaSelectFields[field.dbName || field.name] = true
    }
    return prismaSelectFields
  }

  public getViewFields(): string[] {
    return this.schema.fields.filter((field) => field.view !== false).map((field) => field.dbName || field.name)
  }
}
