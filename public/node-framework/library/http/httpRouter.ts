/**
 * Fastify Router reference: https://fastify.dev/docs/latest/Reference/Routes/#full-declaration
 *
 * URL Builder: https://fastify.dev/docs/latest/Reference/Routes/#url-building
 *
 */
import type { HttpRouterInterface } from "./httpRouter.interface.js"
import type { FastifyInstance } from "fastify"
import type { LoggerInterface } from "../loggers/logger.interface.js"
import type { AutoToHttpSchemaMapper } from "./mapper/autoToHttpSchemaMapper.js"
import type { ApiController } from "./apiController.js"

export class HttpRouter implements HttpRouterInterface {
  protected readonly logger: LoggerInterface
  protected readonly server: FastifyInstance
  protected controller: ApiController
  protected httpSchema: AutoToHttpSchemaMapper

  constructor(
    server: FastifyInstance,
    logger: LoggerInterface,
    controller: ApiController,
    httpSchema: AutoToHttpSchemaMapper,
  ) {
    this.logger = logger
    this.server = server
    this.controller = controller
    this.httpSchema = httpSchema
  }

  async setup(): Promise<void> {}

  // TODO: Criar o método "all" se necessário (suporta todos os métodos)

  delete(path: string, handlerName: string): this {
    this.createRoute("DELETE", path, handlerName)
    return this
  }

  get(url: string, handlerName: string): this {
    this.createRoute("GET", url, handlerName)
    return this
  }

  post(path: string, handlerName: string): this {
    this.createRoute("POST", path, handlerName)
    return this
  }

  put(path: string, handlerName: string): this {
    this.createRoute("PUT", path, handlerName)
    return this
  }

  head(path: string, handlerName: string): this {
    this.createRoute("HEAD", path, handlerName)
    return this
  }

  trace(path: string, handlerName: string): this {
    this.createRoute("TRACE", path, handlerName)
    return this
  }

  options(path: string, handlerName: string): this {
    this.createRoute("OPTIONS", path, handlerName)
    return this
  }

  patch(path: string, handlerName: string): this {
    this.createRoute("PATCH", path, handlerName)
    return this
  }

  // private async loadFullSchema() {
  //   const schemaPath = this.routerDescription.path.replace(/\/([^/]+)\.routes\.ts$/, "/$1.schema.json")
  //
  //   try {
  //     this.logger.info(`Carregando schema "${schemaPath}"\n\tID: "${this.routerDescription.id}"...`)
  //     const { default: schema } = await import(schemaPath, { with: { type: "json" } })
  //     return schema
  //   } catch (error) {
  //     if (error.code === "ERR_MODULE_NOT_FOUND") {
  //       this.logger.error(`Controlador não encontrado no caminho: ${schemaPath}`)
  //     }
  //     throw error
  //   }
  // }

  /**
   * O schema é dividido em vários subsquemas, entre eles o $common que é um schema que pode ser reaproveitado em outros schemas
   *
   * Ref: https://fastify.dev/docs/latest/Reference/Validation-and-Serialization/#validation-and-serialization
   *
   * O common é carregado com addSchema e com id gerado automaticamente apartir de routerDescription.id
   */
  // protected loadCommonSchema() {
  //   // Ref: https://fastify.dev/docs/latest/Reference/Validation-and-Serialization/#core-concepts
  //
  //   this.server.addSchema({
  //     ...this.schema.$common,
  //     $id: this.routerDescription.id,
  //   })
  // }

  /**
   * Creates a route in the Fastify server for the specified method, path, and handler name.
   * Throws an error if the specified handler does not exist in the controller.
   */
  private createRoute(method: string, url: string, handlerName: string) {
    this.logger.info(`Configurando Rota ${method}: ${url}: ${handlerName}`)

    if (!this.controller || typeof this.controller[handlerName] !== "function") {
      const errMsg = `Método "${handlerName}" não implementado no controller.`
      this.logger.error(errMsg)
      throw new Error(errMsg)
    }

    if (this.httpSchema[handlerName]) {
      this.logger.debug(`Carregando schema para ${handlerName}.`)
    }

    // Ref: https://fastify.dev/docs/latest/Reference/Routes/#routes-options
    this.server.route({
      method,
      url,
      schema: this.httpSchema[handlerName],
      handler: async (request, reply) => {
        return this.controller[handlerName](request, reply)
      },
    })
  }
}
