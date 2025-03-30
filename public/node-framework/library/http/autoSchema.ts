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
import type { AutoSchemaInterface } from "#/http/interfaces/schemas/autoSchema/autoSchema.interface.ts"
import type { FieldSchemaInterface } from "#/http/interfaces/schemas/autoSchema/fieldsSchema.interface.ts"
import { sentenceCase } from "change-case"
import { DocsSchemaInterface } from "#/http/interfaces/schemas/autoSchema/docsSchema.interface.js"
import { AutoToOpenApiSchemaMapper } from "#/http/mapper/autoToOpenApiSchemaMapper.js"
import { FastifySchema, RouteOptions } from "fastify"
import { AuthSchemaInterface } from "#/http/interfaces/schemas/autoSchema/authSchema.interface.js"
import { ApiRouteOptionInterface, CustomContextConfig } from "#/http/interfaces/apiRouteOption.interface.js"

const autoSchemaValidator = new ValidatorByInterface(
  "library/http/interfaces/schemas/autoSchema/autoSchema.interface.ts",
  "AutoSchemaInterface",
)

export class AutoSchema {
  private mapper: AutoToOpenApiSchemaMapper

  constructor(
    private logger: LoggerInterface,
    private schema: AutoSchemaInterface,
    mapper?: AutoToOpenApiSchemaMapper,
  ) {
    autoSchemaValidator.validate(schema)
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

  /**
   * Returns the route options for the POST (CREATE) operation.
   * The returned options include a flag 'auto' set to true along with the authentication configuration for the 'create' operation.
   *
   * @returns A Partial<RouteOptions> object to be merged into the route configuration.
   */
  getPostOptions(): Partial<ApiRouteOptionInterface> {
    return {
      config: {
        auto: true,
        ...this.getAuthOptionsFor("create"),
      },
    }
  }

  /**
   * Returns the route options for retrieving all records (GET all).
   *
   * @returns A Partial<RouteOptions> object to be merged into the route configuration.
   */
  getGetAllOptions(): Partial<ApiRouteOptionInterface> {
    return {
      config: {
        auto: true,
        ...this.getAuthOptionsFor("getAll"),
      },
    }
  }

  /**
   * Returns the route options for retrieving a single record (GET).
   *
   * @returns A Partial<RouteOptions> object to be merged into the route configuration.
   */
  getOneOptions(): Partial<ApiRouteOptionInterface> {
    return {
      config: {
        auto: true,
        ...this.getAuthOptionsFor("get"),
      },
    }
  }

  /**
   * Returns the route options for the PUT (UPDATE) operation.
   *
   * @returns A Partial<RouteOptions> object to be merged into the route configuration.
   */
  getPutOptions(): Partial<ApiRouteOptionInterface> {
    return {
      config: {
        auto: true,
        ...this.getAuthOptionsFor("update"),
      },
    }
  }

  /**
   * Returns the route options for the DELETE operation.
   *
   * @returns A Partial<RouteOptions> object to be merged into the route configuration.
   */
  getDeleteOptions(): Partial<ApiRouteOptionInterface> {
    return {
      config: {
        auto: true,
        ...this.getAuthOptionsFor("delete"),
      },
    }
  }

  /**
   * Returns the route options for the CRUD schema operation.
   *
   * @returns A Partial<RouteOptions> object to be merged into the route configuration.
   */
  getCrudOptions(): Partial<ApiRouteOptionInterface> {
    return {
      config: {
        auto: true,
        ...this.getAuthOptionsFor("schema"),
      },
    }
  }

  /**
   * Retrieves the authentication configuration for a given operation from the schema.
   * This method returns only the configuration to be merged inside the 'config' property.
   *
   * @param operation - The operation key (e.g., "create", "getAll", "get", "update", "delete", "schema").
   *
   * @returns An object containing the authentication configuration for the specified operation,
   *          or an empty object if no configuration is defined.
   */
  private getAuthOptionsFor(operation: keyof AuthSchemaInterface): Partial<CustomContextConfig> | undefined {
    const auth = this.schema.auth

    if (auth === undefined) return undefined

    // Scenario 1: auth is a boolean – apply it directly to all operations.
    if (typeof auth === "boolean") {
      return { auth }
    }

    // Scenario 2: auth is an array of roles – apply to all operations.
    if (Array.isArray(auth)) {
      return { auth: true, roles: auth }
    }

    // Scenario 3: auth is an object with specific configuration per operation.
    if (typeof auth === "object") {
      const opConfig = auth[operation]
      if (opConfig === undefined) return undefined
      if (typeof opConfig === "boolean") {
        return { auth: opConfig }
      }
      if (Array.isArray(opConfig)) {
        return { auth: true, roles: opConfig }
      }
    }

    return undefined
  }
}
