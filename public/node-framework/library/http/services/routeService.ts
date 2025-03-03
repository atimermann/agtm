/**
 * Created on 16/02/2025
 *
 * @author André Timermann <andre@timermann.com.br>
 *
 * @file
 * Responsável por criar as rotas definidas pelo usuário ou gerado automaticamente
 *
 *   TODO: Vamos ter um service ou melhor (uma classe q representa um schema carregado) aqui para o Auto schema
 *   Não confundir  autoSchema com FastifySchema
 *   Vamos usar um schema simplificado para as rotas ou usamos o schema original do fastify mesmo
 *   Acho melhor usar original mesmo para as configurações // Complexo, estudar e pensar bem como organizar isso
 *
 *   - Vamos deixa o schema para um segundo momento
 *   - Documentar LER LOG:
 *   - Focar nas validações e erros, log de erro padrão, ver como funciona no fastify
 *   - fazer TODOS do LOG
 *
 *   TODO: Adicionar suporte a uuid com string para melhor segurança
 *
 */
import UserApiFilesService from "./userApiFilesService.ts"
import AutoSchemaService from "./autoSchemaService.ts"

import { ApiRouter } from "../apiRouter.ts"
import { ApiController } from "../apiController.ts"

import type { UserClassFileDescription } from "./userApiFilesService.ts"
import type { FastifyInstance, FastifySchema } from "fastify"
import type LoggerService from "../../services/loggerService.ts"

export default class RouteService {
  private readonly logger: LoggerService
  private readonly server: FastifyInstance
  private readonly userApiFilesService: UserApiFilesService
  private readonly autoSchemaService: AutoSchemaService

  constructor(
    logger: LoggerService,
    server: FastifyInstance,
    userApiFilesService?: UserApiFilesService,
    autoSchemaService?: AutoSchemaService,
  ) {
    this.logger = logger
    this.server = server
    this.userApiFilesService = userApiFilesService ?? new UserApiFilesService(logger)
    this.autoSchemaService = autoSchemaService ?? new AutoSchemaService(logger)
  }

  /**
   * Obtém todos os arquivos de configurações e API do usuário agrupados por nome da rota
   *
   * Cria todas as rotas do usuário baseando dos descritores (descriptors) dos arquivos relacionado a essas rotas
   * Está agrupado por rota (groupedFilesDescriptors)
   */
  async createRoutes() {
    this.logger.debug("---------------------------------------------")
    this.logger.debug("Inicializando sistema de rotas...")
    this.logger.debug("---------------------------------------------")

    this.logger.debug("Carregando configurações das rotas...")
    const groupedFilesDescriptors = await this.userApiFilesService.getFilesDescriptors()

    for (const [descriptorName, fileDescriptors] of Object.entries(groupedFilesDescriptors)) {
      this.validateRequiredRouteFiles(descriptorName, fileDescriptors)
      await this.createRoute(descriptorName, fileDescriptors)
    }
  }

  /**
   * Valida se os arquivos requeridos para criar a rota estão definidos: arquivo de rota ou schema auto.js
   *
   * @param descriptorName
   * @param fileDescriptors
   * @private
   */
  private validateRequiredRouteFiles(
    descriptorName: string,
    fileDescriptors: UserClassFileDescription[],
  ) {
    this.logger.debug(`Validando rotas para "${descriptorName}"...`)
    const hasRequiredType = fileDescriptors.some((file) => ["auto", "router"].includes(file.type))
    if (!hasRequiredType) {
      throw new Error(
        `Route" ${descriptorName} "must have a router (.router.ts) or an auto (.auto.json)`,
      )
    }
  }

  /**
   *  Carrega ou cria rota.
   *
   * @param descriptorName    Nome da rota
   * @param fileDescriptors   Lista de arquivos do usuários com definição da rota
   */
  private async createRoute(descriptorName: string, fileDescriptors: UserClassFileDescription[]) {
    this.logger.debug(`Criando rotas para "${descriptorName}"...`)

    const autoSchema = await this.loadAutoSchema(fileDescriptors, descriptorName)
    const controller = await this.configureController(fileDescriptors, autoSchema)
    // TODO: Configura FastifySchema
    const router = await this.configureRouter(fileDescriptors, controller)

    if (autoSchema) {
      this.configureAutoRoutes(router, autoSchema)
    }

    await router.setup()
  }

  /**
   * Loads auto schema configuration from descriptor if available
   */
  private async loadAutoSchema(
    fileDescriptors: UserClassFileDescription[],
    descriptorName: string,
  ) {
    const autoDescriptor = fileDescriptors.find((file) => file.type === "auto")

    const autoSchema = autoDescriptor
      ? await this.autoSchemaService.createAutoSchemaFromFile(autoDescriptor)
      : null

    this.logger.debug(
      `[${descriptorName}] Automatic Route Configuration: ${autoSchema ? "Yes" : "No"}`,
    )

    return autoSchema
  }

  /**
   * Configures API controller from user descriptor or creates default
   */
  private async configureController(fileDescriptors: UserClassFileDescription[], autoSchema: any) {
    const controllerDescriptor = fileDescriptors.find((file) => file.type === "controller")

    const ControllerClass = controllerDescriptor
      ? (await import(controllerDescriptor.path)).default
      : ApiController

    const controller = new ControllerClass(this.logger)

    this.validateInstance(controller, "__ApiController", controllerDescriptor)

    await controller.init(autoSchema)

    return controller
  }

  /**
   * Validates if an instance matches the expected type.
   *
   * @param instance The object instance to validate.
   * @param expectedType The expected type name (e.g., "__ApiController" or "__ApiRouter").
   * @param descriptor The file descriptor, if available.
   */
  private validateInstance(
    instance: any,
    expectedType: string,
    descriptor?: UserClassFileDescription,
  ) {
    if (instance.__INSTANCE__ === expectedType) return

    const typeName = expectedType.replace("__", "") // Remove underscores for better readability
    const message = descriptor
      ? `${typeName} "${descriptor.id}" is not a valid "${typeName}" instance!`
      : `${typeName} is not a valid "${typeName}" instance!`

    throw new TypeError(message)
  }

  /**
   * Configures API router from user descriptor or creates default
   */
  private async configureRouter(fileDescriptors: UserClassFileDescription[], controller: any) {
    const routerDescriptor = fileDescriptors.find((file) => file.type === "router")

    const RouterClass: typeof ApiRouter = routerDescriptor
      ? (await import(routerDescriptor.path)).default
      : ApiRouter

    const router = new RouterClass(this.logger, this.server, controller, routerDescriptor)

    this.validateInstance(router, "__ApiRouter", routerDescriptor)

    return router
  }

  /**
   * Configures automatic CRUD routes based on schema
   */
  private configureAutoRoutes(router: ApiRouter, autoSchema: any) {
    const routeName: string = autoSchema.routeName

    const idParamSchema: FastifySchema = {
      description: "post some data",
      tags: ["user", "product"],
      summary: "qwerty",
      params: {
        type: "object",
        properties: {
          id: { type: "integer" },
        },
        required: ["id"],
      },
    }

    router.post(`/${routeName}`, "create")
    router.get(`/${routeName}`, "getAll")
    router.get(`/${routeName}/:id(\\d+)`, "get", idParamSchema)
    router.put(`/${routeName}/:id(\\d+)`, "update", idParamSchema)
    router.delete(`/${routeName}/:id(\\d+)`, "delete", idParamSchema)
    router.get(`/${routeName}/schema`, "schema")
  }
}
