// TODO: Para analisar
// import type { AutoSchemaHandler } from "../autoSchemaHandler.js"
//
// export class AutoToHttpSchemaMapper {
//   private autoSchema: AutoSchemaHandler
//
//   constructor(schema: AutoSchemaHandler) {
//     this.autoSchema = schema
//   }
//
//   /**
//    * Gera todos os schemas de validação e serialização utilizado pelo Fastify a partir do AutoSchema
//    *
//    * REF: https://fastify.dev/docs/latest/Reference/Validation-and-Serialization/#validation
//    */
//   public mapSchema() {
//     return {
//       dynamicCreate: {
//         body: this.mapBody("create"),
//         query: undefined,
//         params: undefined,
//         header: undefined,
//       },
//       dynamicGetAll: undefined,
//       dynamicGet: {
//         body: undefined,
//         query: undefined,
//         params: this.mapParam(),
//         header: undefined,
//       },
//       dynamicUpdate: {
//         body: this.mapBody("update"),
//         query: undefined,
//         params: this.mapParam(),
//         header: undefined,
//       },
//       dynamicDelete: {
//         body: undefined,
//         query: undefined,
//         params: this.mapParam(),
//         header: undefined,
//       },
//       dynamicSchema: undefined,
//     }
//   }
//
//   /**
//    * Converte o schema de fields para o formato JSON Schema do Fastify
//    */
//   private mapBody(route: string): object {
//     const jsonSchema = {
//       type: "object",
//       required: [],
//       properties: {},
//     }
//
//     for (const field of this.autoSchema.schema.fields) {
//       if (route === "create" && field.create === false) continue
//       if (route === "update" && field.update === false) continue
//
//       jsonSchema.properties[field.name] = {
//         type: this.mapFieldType(field.type),
//       }
//
//       // Campo Obrigatório
//       if (field.required) {
//         jsonSchema.required.push(field.name)
//       }
//     }
//
//     return jsonSchema
//   }
//
//   /**
//    * Define os parametros usados para filtrar dados, o padrão é ID
//    * @private
//    */
//   private mapParam(): object {
//     return {
//       type: "object",
//       properties: {
//         id: { type: "integer" },
//       },
//     }
//   }
//
//   /**
//    * Mapeia os tipos do AutoSchema para os tipos suportados pelo JSON Schema do Fastify
//    * REF: https://json-schema.org/understanding-json-schema/reference/type
//    */
//   private mapFieldType(type?: string): string {
//     switch (type) {
//       case "string":
//         return "string"
//       case "integer":
//         return "integer"
//       case "number":
//         return "number"
//       case "boolean":
//         return "boolean"
//       case "array":
//         return "array"
//       default:
//         return "string"
//     }
//   }
// }
