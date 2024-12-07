import type { LoggerInterface } from "../loggers/logger.interface.ts"
import type { UserClassFileDescription } from "./httpServer2.ts"
import { resolve } from "node:path"
import { existsSync } from "fs"
import type { FastifyInstance } from "fastify"
import type { HttpRouterInterface } from "./httpRouter.interface.ts"
import { HttpRouter } from "./httpRouter.ts"
import DynamicController from "./dynamicController.ts"
import { AutoSchemaHandler } from "./autoSchemaHandler.ts"

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

    this.logger.debug(`Loading controller: "${controllerPath}"...`)
    const controllerExist = existsSync(controllerPath)

    const controllerInstance = controllerExist
      ? await this.loadAndInitializeController(controllerPath)
      : new DynamicController(autoSchema, this.logger)

    await controllerInstance.setup()

    ////////////////////////////////////////////////////////////////////////////
    // 03. CREATE ROUTE
    ////////////////////////////////////////////////////////////////////////////
    const routerPath = fileDescription.path.replace(/\.auto\.json$/, ".router.ts")
    this.logger.debug(`Loading router: "${routerPath}"...`)

    const routingExist = existsSync(routerPath)

    if (!routingExist) {
      this.logger.debug(`Router not defined! Generating auto route for "${fileDescription.id}"...`)
    }

    const routerInstance = routingExist
      ? await this.loadAndInitializeRouter(routerPath)
      : new HttpRouter(this.server, this.logger, fileDescription, controllerInstance)

    ////////////////////////////////////////////////////////////////////////////
    // 04. CONFIGURE ROUTE
    ////////////////////////////////////////////////////////////////////////////

    // Create auto route
    const routeName: string = autoSchema.schema.route
    // const capitalizeRoute: string = capitalize(routeName)
    // const pluralizeRoute = pluralize(capitalizeRoute)

    routerInstance.post(`/${routeName}`, "dynamicCreate")
    routerInstance.get(`/${routeName}`, "dynamicGetAll")
    routerInstance.get(`/${routeName}/:id`, "dynamicGet")
    routerInstance.put(`/${routeName}/:id`, "dynamicUpdate")
    routerInstance.delete(`/${routeName}/:id`, "dynamicDelete")
    routerInstance.get(`/${routeName}/schema`, "dynamicSchema")

    ////////////////////////////////////////////////////////////////////////////
    // FIM
    ////////////////////////////////////////////////////////////////////////////

    this.logger.info("================================> OK <===============================>")
    this.logger.info("================================> OK <===============================>")
    this.logger.info("================================> OK <===============================>")
    this.logger.info("================================> OK <===============================>")
  }

  /**
   * Importa e instancia a classe do router existente.
   *
   * @param routerPath
   */
  private async loadAndInitializeRouter(routerPath: string): Promise<HttpRouterInterface> {
    try {
      const { default: RouterClass } = await import(resolve(routerPath))
      const routerInstance = new RouterClass(this.server, this.logger) as HttpRouterInterface
      await routerInstance.setup()
      return routerInstance
    } catch (error) {
      this.logger.error(`Failed to load router: "${routerPath}".`)
      throw error
    }
  }

  /**
   * Importa e iniciancia novos controllers
   * @param controllerPath
   * @private
   */
  private async loadAndInitializeController(controllerPath: string): Promise<DynamicController> {
    try {
      const { default: ControllerClass } = await import(resolve(controllerPath))
      return new ControllerClass()
    } catch (error) {
      this.logger.error(`Failed to load router: "${controllerPath}".`)
      throw error
    }
  }
}
