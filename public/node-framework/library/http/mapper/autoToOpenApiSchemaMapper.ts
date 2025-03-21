/**
 * Created on 03/03/2025
 *
 * @author André Timermann <andre@timermann.com.br>
 *
 * @file
 * Mapeia o Api Schema (schema simplificado para configuração de rota criado no nodeFramework e definido por AutoSchemaInterface)
 * Para padrão FastifySchema (baseado no padrão OpenAPI)
 *
 * Ele não faz mapeamento direto, como gera uma configuração de rota completo levantando informações de todo Schema
 *
 */
import type { AutoSchemaInterface } from "#/http/interfaces/autoSchema/autoSchema.interface.ts"
import type { FastifySchema } from "fastify"

const CREATE = 1
const UPDATE = 2

export interface JsonSchema {
  type: "object"
  required: string[]
  properties: Record<string, { type: string; default: unknown }>
  additionalProperties: boolean
}

export class AutoToOpenApiSchemaMapper {
  constructor(private autoSchema: AutoSchemaInterface) {}
  /**
   * Mapeia o AutoSchema para o Fastify Schema para a rota POST.
   *
   * @returns {FastifySchema} Fastify schema para criação de um novo registro.
   */
  public mapPostSchema(): FastifySchema {
    return {
      body: this.mapBodyForCreateOrUpdate(CREATE),
      querystring: undefined,
      params: undefined,
      headers: undefined,
    }
  }

  /**
   * Mapeia o AutoSchema para o Fastify Schema para a rota PUT.
   *
   * @returns {FastifySchema} Fastify schema para atualização de um registro existente.
   */
  public mapPutSchema(): FastifySchema {
    return {
      body: this.mapBodyForCreateOrUpdate(CREATE),
      querystring: undefined,
      params: this.mapParam(),
      headers: undefined,
    }
  }

  /**
   * Mapeia o AutoSchema para o Fastify Schema para a rota de obter todos os registros.
   *
   * @returns {FastifySchema} Fastify schema para recuperar múltiplos registros.
   */
  public mapGetAllSchema(): FastifySchema {
    return {
      body: undefined,
      querystring: undefined,
      params: undefined,
      headers: undefined,
    }
  }

  /**
   * Mapeia o AutoSchema para o Fastify Schema para a rota de obter um registro.
   *
   * @returns {FastifySchema} Fastify schema para recuperar um registro único.
   */
  public mapGetOneSchema(): FastifySchema {
    return {
      body: undefined,
      querystring: undefined,
      params: this.mapParam(),
      headers: undefined,
    }
  }

  /**
   * Mapeia o AutoSchema para o Fastify Schema para a rota de exclusão de um registro.
   *
   * @returns {FastifySchema} Fastify schema para remoção de um registro.
   */
  public mapDeleteSchema(): FastifySchema {
    return {
      body: undefined,
      querystring: undefined,
      params: this.mapParam(),
      headers: undefined,
    }
  }

  /**
   * Mapeia o AutoSchema para o Fastify Schema para operações CRUD.
   *
   * @returns {FastifySchema} Fastify schema para geração da interface CRUD.
   */
  public mapCrudSchema(): FastifySchema {
    return {
      body: undefined,
      querystring: undefined,
      params: undefined,
      headers: undefined,
    }
  }

  /**
   * Converte o schema de fields para o formato JSON Schema do Fastify
   */
  private mapBodyForCreateOrUpdate(route: number): object {
    const jsonSchema: JsonSchema = {
      type: "object",
      required: [],
      properties: {},
      // Configuração abaixo não funciona pois está sendo usado o AJV com atributo removeAdditional
      // https://fastify.dev/docs/latest/Reference/Validation-and-Serialization/#validator-compiler
      additionalProperties: false,
    }

    for (const field of this.autoSchema.fields) {
      if (route === CREATE && field.create === false) continue
      if (route === UPDATE && field.update === false) continue

      jsonSchema.properties[field.name] = {
        type: this.mapFieldType(field.type),
        default: field.default,
      }

      if (field.required) {
        jsonSchema.required.push(field.name)
      }
    }

    return jsonSchema
  }

  /**
   * Define os parametrise enviado pelo usuário
   * Ex: id para alterar
   *
   */
  private mapParam() {
    return {
      type: "object",
      properties: {
        id: { type: "integer" },
      },
      required: ["id"],
    }
  }

  /**
   * Mapeia os tipos do AutoSchema para os tipos suportados pelo JSON Schema do Fastify
   * REF: https://json-schema.org/understanding-json-schema/reference/type
   */
  private mapFieldType(type?: string): string {
    switch (type) {
      case "string":
        return "string"
      case "integer":
        return "integer"
      case "number":
        return "number"
      case "boolean":
        return "boolean"
      case "array":
        return "array"
      default:
        return "string"
    }
  }
}
