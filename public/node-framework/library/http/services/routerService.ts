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
import { UserApiFilesService, validateInstance } from "./userApiFilesService.ts"
import { AutoSchemaService } from "./autoSchemaService.ts"

import { ApiRouter } from "../apiRouter.ts"
import type { ApiController } from "../apiController.ts"
import { join } from "node:path"

import type { UserClassFileDescription, UserClassFilesGrouped } from "./userApiFilesService.ts"
import type { FastifyInstance } from "fastify"
import type { LoggerService } from "#/services/loggerService.ts"
import type { SwaggerPlugin } from "#/http/plugins/swagger.js"
import type { AutoSchema } from "#/http/autoSchema.js"
import type { PrismaService } from "#/services/prismaService.js"
import type { ConfigService } from "#/services/configService.js"
import { ControllerFactory } from "#/http/factories/controllerFactory.js"
import { AutoFactory } from "#/http/factories/autoFactory.js"

export class RouterService {
  private readonly userApiFilesService: UserApiFilesService
  private readonly autoSchemaService: AutoSchemaService
  private readonly controllerFactory: ControllerFactory
  private readonly autoApiFactory: AutoFactory

  constructor(
    private readonly logger: LoggerService,
    private readonly config: ConfigService,
    private readonly prismaService: PrismaService,
    private readonly fastify: FastifyInstance,
    private readonly swagger: SwaggerPlugin,
    userApiFilesService?: UserApiFilesService,
    autoSchemaService?: AutoSchemaService,
    controllerFactory?: ControllerFactory,
  ) {
    this.userApiFilesService = userApiFilesService ?? new UserApiFilesService(logger)
    this.autoSchemaService = autoSchemaService ?? new AutoSchemaService(logger)
    this.controllerFactory =
      controllerFactory ?? new ControllerFactory(this.logger, this.config, prismaService, fastify)
    this.autoApiFactory = new AutoFactory(this.logger, this.prismaService)
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

    for (const appDirectory of await this.userApiFilesService.getApps()) {
      const appName = appDirectory.name
      const appPath = join(appDirectory.parentPath, appDirectory.name)

      const groupedFilesDescriptors = await this.userApiFilesService.getFilesDescriptors(appName, appPath)

      for (const [descriptorName, fileDescriptors] of Object.entries(groupedFilesDescriptors)) {
        await this.createRoute(appName, descriptorName, fileDescriptors, groupedFilesDescriptors)
      }
    }
  }

  /**
   *  Carrega ou cria rota.
   *
   * @param appName           - Nome da aplicação
   * @param descriptorName    - Nome da rota
   * @param fileDescriptors   - Lista de arquivos do usuários com definição da rota
   * @param groupedFilesDescriptors
   */
  private async createRoute(
    appName: string,
    descriptorName: string,
    fileDescriptors: UserClassFileDescription[],
    groupedFilesDescriptors: UserClassFilesGrouped,
  ) {
    this.logger.debug(`Criando rotas para "${descriptorName}"...`)

    const autoSchema = await this.createAutoSchema(fileDescriptors, descriptorName)
    const autoApi = await this.autoApiFactory.create(appName, descriptorName, groupedFilesDescriptors, autoSchema)
    const controller = await this.controllerFactory.create(appName, fileDescriptors, autoSchema, autoApi)
    const router = await this.createRouter(appName, fileDescriptors, controller)

    // TODO: Configura FastifySchema

    if (autoSchema) {
      this.configureAutoRoutes(router, autoSchema)
    }

    await router.setup()
    router.run()
  }

  /**
   * Loads auto schema configuration from descriptor if available
   */
  private async createAutoSchema(
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
   * Configures API router from user descriptor or creates default
   */
  private async createRouter(appName: string, fileDescriptors: UserClassFileDescription[], controller: ApiController) {
    const routerDescriptor = fileDescriptors.find((file) => file.type === "router")
    const RouterClass: typeof ApiRouter = routerDescriptor ? (await import(routerDescriptor.path)).default : ApiRouter

    const router = new RouterClass(this.logger, this.fastify, controller, appName, routerDescriptor)

    validateInstance(router, "__ApiRouter", routerDescriptor)
    return router
  }

  /**
   * Configura rotas automáticas
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
