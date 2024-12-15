import type { LoggerInterface } from "../loggers/logger.interface.ts"
import type { UserClassFileDescription } from "./httpServer2.ts"
import { resolve } from "node:path"
import { existsSync } from "fs"
import type { FastifyInstance } from "fastify"
import type { HttpRouterInterface } from "./httpRouter.interface.ts"
import { HttpRouter } from "./httpRouter.ts"
import { ApiController } from "./apiController.ts"
import { AutoSchemaHandler } from "./autoSchemaHandler.ts"
import { AutoToHttpSchemaMapper } from "./mapper/autoToHttpSchemaMapper.ts"

export default class ApiGenerator {
  protected logger: LoggerInterface
  protected readonly server: FastifyInstance

  constructor(logger: LoggerInterface, server: FastifyInstance) {
    this.logger = logger
    this.server = server
  }

  /**
   * Gera uma nova API completa automaticamente baseado no schema
   *
   * @param fileDescription
   */
  async generate(fileDescription: UserClassFileDescription) {
    this.logger.debug(`Generating API for: "${fileDescription.id}"`)

    ////////////////////////////////////////////////////////////////////////////
    // 01. CREATE SCHEMA HANDLER
    ////////////////////////////////////////////////////////////////////////////
    const autoSchema = await AutoSchemaHandler.createFromFile(fileDescription)

    ////////////////////////////////////////////////////////////////////////////
    // 02. CREATE CONTROLLER
    ////////////////////////////////////////////////////////////////////////////
    const controllerPath = fileDescription.path.replace(/\.auto\.json$/, ".controller.ts")
    const controllerInstance = await this.loadAndInitializeApiController(controllerPath, autoSchema)

    if (controllerInstance.__INSTANCE__ !== "__HttpController") {
      throw new TypeError(`The controller "${controllerPath}" it is not "HttpController" instance!`)
    }

    await controllerInstance.setup()

    ////////////////////////////////////////////////////////////////////////////
    // 03. CREATE SCHEMA HANDLER
    ////////////////////////////////////////////////////////////////////////////

    // const httpSchemaPath = fileDescription.path.replace(/\.auto\.json$/, ".schema.ts")
    //
    // this.logger.debug(`Loading http server schema(Fastify): "${controllerPath}"...`)
    // const httpSchemarExist = existsSync(httpSchemaPath)
    //
    // const httpSchema = httpSchemarExist
    //   ? await this.loadAndInitializeSchema(httpSchemaPath)
    //   :

    const httpSchema = new AutoToHttpSchemaMapper(autoSchema)

    ////////////////////////////////////////////////////////////////////////////
    // 04. CREATE ROUTE
    ////////////////////////////////////////////////////////////////////////////
    const routerPath = fileDescription.path.replace(/\.auto\.json$/, ".router.ts")
    this.logger.debug(`Loading router: "${routerPath}"...`)

    const routingExist = existsSync(routerPath)

    if (!routingExist) {
      this.logger.debug(`Router not defined! Generating auto route for "${fileDescription.id}"...`)
    }

    const routerInstance = await this.loadAndInitializeRouter(
      routerPath,
      controllerInstance,
      httpSchema.mapSchema(),
    )

    ////////////////////////////////////////////////////////////////////////////
    // 05. CONFIGURE ROUTE
    ////////////////////////////////////////////////////////////////////////////

    // Create auto route
    const routeName: string = autoSchema.schema.route
    // const capitalizeRoute: string = capitalize(routeName)
    // const pluralizeRoute = pluralize(capitalizeRoute)

    routerInstance.post(`/${routeName}`, "create")
    routerInstance.get(`/${routeName}`, "getAll")
    routerInstance.get(`/${routeName}/:id(\\d+)`, "get")
    routerInstance.put(`/${routeName}/:id(\\d+)`, "update")
    routerInstance.delete(`/${routeName}/:id(\\d+)`, "delete")
    routerInstance.get(`/${routeName}/schema`, "schema")

    await routerInstance.setup()

    ////////////////////////////////////////////////////////////////////////////
    // FIM
    ////////////////////////////////////////////////////////////////////////////
  }

  /**
   * Importa e instancia a classe do router existente.
   *
   * @param routerPath
   * @param controllerInstance
   * @param httpSchema
   */
  private async loadAndInitializeRouter(
    routerPath: string,
    controllerInstance: ApiController,
    httpSchema: AutoToHttpSchemaMapper,
  ): Promise<HttpRouterInterface> {
    try {
      this.logger.debug(`Loading controller: "${routerPath}"...`)

      const RouterClass = existsSync(routerPath)
        ? (await import(resolve(routerPath))).default
        : HttpRouter

      return new RouterClass(this.server, this.logger, controllerInstance, httpSchema)
    } catch (error) {
      this.logger.error(`Failed to load router: "${routerPath}".`)
      throw error
    }
  }

  /**
   * Importa e iniciancia novos controllers (Gerado automaticamente ou userspace)
   *
   * @param controllerPath
   * @param autoSchema
   */
  private async loadAndInitializeApiController(
    controllerPath: string,
    autoSchema: AutoSchemaHandler,
  ): Promise<ApiController> {
    try {
      this.logger.debug(`Loading controller: "${controllerPath}"...`)

      const ControllerClass = existsSync(controllerPath)
        ? (await import(resolve(controllerPath))).default
        : ApiController

      return new ControllerClass(autoSchema, this.logger)
    } catch (error) {
      this.logger.error(`Failed to load router: "${controllerPath}".`)
      throw error
    }
  }
}
