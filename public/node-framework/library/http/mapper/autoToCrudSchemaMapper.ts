/**
 * **Created on 09/04/2025**
 *
 * @author André Timermann <andre@timermann.com.br>
 *
 * @file
 *    Mapeia o Auto Schema para o Crud SChema que será utilizado no front-end para renderizar o CRUD
 *
 */

import { sentenceCase } from "change-case"
import type { AutoSchemaInterface } from "#/http/interfaces/schemas/autoSchema/autoSchema.interface.ts"

/**
 * Class responsible for mapping an AutoSchema configuration to a CRUD schema.
 */
export class AutoToCrudSchemaMapper {
  private schema: AutoSchemaInterface

  /**
   * Creates an instance of AutoToCrudSchemaMapper.
   *
   * @param {AutoSchemaInterface} schema - The AutoSchema configuration object.
   */
  constructor(schema: AutoSchemaInterface) {
    this.schema = schema
  }

  /**
   * Maps the AutoSchema format to the CRUD schema format for the frontend.
   *
   */
  map() {
    const crudSchema: any = {
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
      // if (!field.create && !field.update && !field.view) continue

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
}
