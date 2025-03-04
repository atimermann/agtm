/**
 * Created on 26/02/2025
 *
 * @author
 *   André Timermann <andre@timermann.com.br>
 *
 * @file
 *   Classe `AutoSchema` responsável por mapear e validar o schema de configurações de API
 *   (implementado via `AutoSchemaInterface`), fornecendo métodos auxiliares para processamento e acesso informações
 *   do schema
 *
 * Descrição:
 *   - Realiza validação inicial do schema (por meio de `ValidatorByInterface`).
 *   - Disponibiliza getters específicos para atributos essenciais (rota, model, chave primária, lista de campos).
 *
 */
import ValidatorByInterface from "../utils/validatorByInterface.js"
import type { LoggerInterface } from "../loggers/logger.interface.js"
import type { AutoSchemaInterface } from "./interfaces/autoSchema/autoSchema.interface.ts"
import type { FieldSchemaInterface } from "./interfaces/autoSchema/fieldsSchema.interface.ts"
import { sentenceCase } from "change-case"
import { DocsSchemaInterface } from "#/http/interfaces/autoSchema/docsSchema.interface.js"
import { AutoToOpenApiSchemaMapper } from "#/http/mapper/autoToOpenApiSchemaMapper.js"
import { FastifySchema } from "fastify"

const autoSchemaValidator = new ValidatorByInterface(
  "library/http/interfaces/autoSchema/autoSchema.interface.ts",
  "AutoSchemaInterface",
)

export default class AutoSchema {
  private schema: AutoSchemaInterface
  private logger: LoggerInterface
  private mapper: AutoToOpenApiSchemaMapper

  constructor(
    logger: LoggerInterface,
    schema: AutoSchemaInterface,
    mapper?: AutoToOpenApiSchemaMapper,
  ) {
    this.logger = logger
    autoSchemaValidator.validate(schema)
    this.schema = schema
    this.mapper = mapper ?? new AutoToOpenApiSchemaMapper(schema)
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
   * Retorna dados de documentação
   */
  get docs(): DocsSchemaInterface | undefined {
    return this.schema.docs
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
  mapApiSchemaToCrudSchema(): any {
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

  /**
   * Generates a base Fastify schema with common properties for all routes.
   *
   * @private
   * @returns {FastifySchema} The base Fastify schema object.
   */
  private getBaseSchemaForAllRoutes(): FastifySchema {
    return {
      tags: [this.docs?.name ? this.docs.name : this.routeName],
    }
  }

  /**
   * Converts the AutoSchema configuration into a Fastify schema for the POST (CREATE) route.
   *
   * @returns {FastifySchema} The Fastify schema for creating a new record.
   */
  getPostSchema(): FastifySchema {
    return {
      ...this.getBaseSchemaForAllRoutes(),
      ...this.mapper.mapPostSchema(),
      summary: `Cria novo registro.`,
    }
  }

  /**
   * Converts the AutoSchema configuration into a Fastify schema for the PUT (UPDATE) route.
   *
   * @returns {FastifySchema} The Fastify schema for updating an existing record.
   */
  getPutSchema(): FastifySchema {
    return {
      ...this.getBaseSchemaForAllRoutes(),
      ...this.mapper.mapPutSchema(),
      summary: `Altera registro.`,
    }
  }

  /**
   * Converts the AutoSchema configuration into a Fastify schema for retrieving multiple records.
   *
   * @returns {FastifySchema} The Fastify schema for retrieving all or filtered records.
   */
  getGetAllSchema(): FastifySchema {
    return {
      ...this.getBaseSchemaForAllRoutes(),
      ...this.mapper.mapGetAllSchema(),
      summary: `Retorna todos os registros ou registros filtrados.`,
    }
  }

  /**
   * Converts the AutoSchema configuration into a Fastify schema for retrieving a single record by id.
   *
   * @returns {FastifySchema} The Fastify schema for retrieving a record.
   */
  getGetOneSchema(): FastifySchema {
    return {
      ...this.getBaseSchemaForAllRoutes(),
      ...this.mapper.mapGetOneSchema(),
      summary: `Retorna um registro por id.`,
    }
  }

  /**
   * Converts the AutoSchema configuration into a Fastify schema for deleting a record.
   *
   * @returns {FastifySchema} The Fastify schema for deleting a record.
   */
  getDeleteSchema(): FastifySchema {
    return {
      ...this.getBaseSchemaForAllRoutes(),
      ...this.mapper.mapDeleteSchema(),
      summary: `Remove registro.`,
    }
  }

  /**
   * Converts the AutoSchema configuration into a Fastify schema for generating a CRUD interface on the frontend.
   *
   * @returns {FastifySchema} The Fastify schema for CRUD operations.
   */
  getCrudSchema(): FastifySchema {
    return {
      ...this.getBaseSchemaForAllRoutes(),
      ...this.mapper.mapCrudSchema(),
      summary: `Retorna schema para gerar crud automaticamente no frontend.`,
    }
  }
}
