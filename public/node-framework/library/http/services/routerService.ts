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
import type { FastifyInstance } from "fastify"
import type LoggerService from "#/services/loggerService.ts"
import type { SwaggerPlugin } from "#/http/plugins/swagger.js"
import AutoSchema from "#/http/autoSchema.js"
import { PrismaService } from "#/services/prismaService.js"
import { ConfigService } from "#/services/configService.js"

export default class RouterService {
  private readonly userApiFilesService: UserApiFilesService
  private readonly autoSchemaService: AutoSchemaService

  constructor(
    private readonly logger: LoggerService,
    private readonly config: ConfigService,
    private readonly prismaService: PrismaService,
    private readonly fastify: FastifyInstance,
    private readonly swagger: SwaggerPlugin,
    userApiFilesService?: UserApiFilesService,
    autoSchemaService?: AutoSchemaService,
  ) {
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
    router.run()
  }

  /**
   * Valida se os arquivos requeridos para criar a rota estão definidos: arquivo de rota ou schema auto.js
   *
   * @param descriptorName
   * @param fileDescriptors
   * @private
   */
  private validateRequiredRouteFiles(descriptorName: string, fileDescriptors: UserClassFileDescription[]) {
    this.logger.debug(`Validando rotas para "${descriptorName}"...`)
    const hasRequiredType = fileDescriptors.some((file) => file.type && ["auto", "router"].includes(file.type))
    if (!hasRequiredType) {
      throw new Error(`Route" ${descriptorName} "must have a router (.router.ts) or an auto (.auto.json)`)
    }
  }

  /**
   * Loads auto schema configuration from descriptor if available
   */
  private async loadAutoSchema(
    fileDescriptors: UserClassFileDescription[],
    descriptorName: string,
  ): Promise<AutoSchema | undefined> {
    const autoDescriptor = fileDescriptors.find((file) => file.type === "auto")
    const autoSchema = autoDescriptor
      ? await this.autoSchemaService.createAutoSchemaFromFile(autoDescriptor)
      : undefined
    this.logger.debug(`[${descriptorName}] Automatic Route Configuration: ${autoSchema ? "Yes" : "No"}`)
    return autoSchema
  }

  /**
   * Configures API controller from user descriptor or creates default
   */
  private async configureController(fileDescriptors: UserClassFileDescription[], autoSchema?: AutoSchema) {
    const controllerDescriptor = fileDescriptors.find((file) => file.type === "controller")

    const ControllerClass: typeof ApiController = controllerDescriptor
      ? (await import(controllerDescriptor.path)).default
      : ApiController

    const controller = new ControllerClass(this.logger, this.config, this.prismaService, this.fastify)
    this.validateInstance(controller, "__ApiController", controllerDescriptor)
    await controller.init(autoSchema)
    await controller.setup()
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
    instance: ApiController | ApiRouter,
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
  private async configureRouter(fileDescriptors: UserClassFileDescription[], controller: ApiController) {
    const routerDescriptor = fileDescriptors.find((file) => file.type === "router")
    const RouterClass: typeof ApiRouter = routerDescriptor ? (await import(routerDescriptor.path)).default : ApiRouter
    const router = new RouterClass(this.logger, this.fastify, controller, routerDescriptor)
    this.validateInstance(router, "__ApiRouter", routerDescriptor)
    return router
  }

  /**
   * Configura rotas automaticas
   *
   * @param router      - Instancia da Api de rotas do usuário
   * @param autoSchema  - Auto Schema definido pelo usuário (auto.json)
   */
  private configureAutoRoutes(router: ApiRouter, autoSchema: AutoSchema) {
    if (autoSchema.docs?.name) {
      this.swagger.addTag(autoSchema.docs.name, autoSchema.docs.description)
    }

    router.post(`/${autoSchema.routeName}`, "create", autoSchema.getPostSchema(), autoSchema.getPostOptions())
    router.get(`/${autoSchema.routeName}`, "getAll", autoSchema.getGetAllSchema(), autoSchema.getGetAllOptions())
    router.get(`/${autoSchema.routeName}/:id(\\d+)`, "get", autoSchema.getGetOneSchema(), autoSchema.getOneOptions())
    router.put(`/${autoSchema.routeName}/:id(\\d+)`, "update", autoSchema.getPutSchema(), autoSchema.getPutOptions())
    router.delete(
      `/${autoSchema.routeName}/:id(\\d+)`,
      "delete",
      autoSchema.getDeleteSchema(),
      autoSchema.getDeleteOptions(),
    )
    router.get(`/${autoSchema.routeName}/schema`, "schema", autoSchema.getCrudSchema(), autoSchema.getCrudOptions())
  }
}
