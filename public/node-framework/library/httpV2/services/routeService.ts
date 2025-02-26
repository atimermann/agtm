/**
 * Created on 16/02/2025
 *
 * @author André Timermann <andre@timermann.com.br>
 *
 * @file
 * Responsável por criar as rotas definidas pelo usuário ou gerado automaticamente
 *
 */
import UserApiFilesService from "./userApiFilesService.ts"
import AutoSchemaService from "./autoSchemaService.ts"

import { ApiRouter } from "../apiRouter.ts"
import { ApiController } from "../apiController.ts"

import type { UserClassFileDescription } from "./userApiFilesService.ts"
import type { FastifyInstance } from "fastify"
import type LoggerService from "../../services/loggerService.ts"

export default class RouteService {
  private readonly logger: LoggerService
  private readonly server: FastifyInstance
  private readonly userApiFilesService: UserApiFilesService
  private readonly autoSchemaService: AutoSchemaService

  constructor(logger: LoggerService, server: FastifyInstance) {
    this.logger = logger
    this.server = server
    this.userApiFilesService = new UserApiFilesService(logger)
    this.autoSchemaService = new AutoSchemaService(logger)
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

    // AGORA VAMOS:
    //     - Controllers base vão ter as rotas automaticas, mas só vai ser "ativada" se existir o auto
    //     - Finalmente vamos implementar o schema, é um tema complexo q tem muitas abordagem, ver documentação
    //     - DOCUMENTAR TUDO
    //     - Revisar logs e catch padrão

    ////////////////////////////////////////////////////////////
    // 01 - Carrega schema de configuração Auto
    ////////////////////////////////////////////////////////////
    const autoDescriptor = fileDescriptors.find((file) => file.type === "auto")

    const autoSchema = autoDescriptor
      ? await this.autoSchemaService.createAutoSchemaFromFile(autoDescriptor)
      : null

    this.logger.debug(
      `[${descriptorName}] Configuração automática de Rota: ${autoSchema ? "Sim" : "Não"}`,
    )
    ////////////////////////////////////////////////////////////
    // 02 - Configura Controller
    ////////////////////////////////////////////////////////////
    const controllerDescriptor = fileDescriptors.find((file) => file.type === "controller")

    const ControllerClass = controllerDescriptor
      ? (await import(controllerDescriptor.path)).default
      : ApiController

    const controller = new ControllerClass(this.logger)

    if (controller.__INSTANCE__ !== "__ApiController") {
      if (controllerDescriptor) {
        throw new TypeError(
          `Controller "${controllerDescriptor.id}" it is not "ApiController" instance!`,
        )
      }
      throw new TypeError('ApiController it is not "ApiController" instance!')
    }

    await controller.init(autoSchema)

    ////////////////////////////////////////////////////////////
    // 03 - Configura FastifySchema
    ////////////////////////////////////////////////////////////

    ////////////////////////////////////////////////////////////
    // 04 - Carrega Rota do Usuário ou instancia uma nova vazia
    ////////////////////////////////////////////////////////////
    const routerDescriptor = fileDescriptors.find((file) => file.type === "router")

    const RouterClass: typeof ApiRouter = routerDescriptor
      ? (await import(routerDescriptor.path)).default
      : ApiRouter

    const router = new RouterClass(this.logger, this.server, controller, routerDescriptor)

    if (router.__INSTANCE__ !== "__ApiRouter") {
      if (routerDescriptor) {
        throw new TypeError(`Router "${routerDescriptor.id}" it is not "ApiRouter" instance!`)
      }
      throw new TypeError('Router it is not "ApiRouter" instance!')
    }

    ////////////////////////////////////////////////////////////
    // 05 - Configura Rota no modo Auto
    ////////////////////////////////////////////////////////////

    if (autoSchema) {
      // Create auto route
      const routeName: string = autoSchema.routeName
      // const capitalizeRoute: string = capitalize(routeName)
      // const pluralizeRoute = pluralize(capitalizeRoute)

      router.post(`/${routeName}`, "create")
      router.get(`/${routeName}`, "getAll")

      // TODO: criar schema próprio, schema do fastify é muito feio
      router.get(`/${routeName}/:id(\\d+)`, "get", {
        params: {
          type: "object",
          properties: {
            id: { type: "integer" },
          },
          required: ["id"],
        },
      })
      router.put(`/${routeName}/:id(\\d+)`, "update", {
        params: {
          type: "object",
          properties: {
            id: { type: "integer" },
          },
          required: ["id"],
        },
      })
      router.delete(`/${routeName}/:id(\\d+)`, "delete", {
        params: {
          type: "object",
          properties: {
            id: { type: "integer" },
          },
          required: ["id"],
        },
      })
      router.get(`/${routeName}/schema`, "schema")
    }

    // TODO: Vamos ter um service ou melhor (uma classe q representa um schema carregado) aqui para o Auto schema
    // Não confundir  autoSchema com FastifySchema
    // Vamos usar um schema simplificado para as rotas ou usamos o schema original do fastify mesmo
    // Acho melhor usar original mesmo para as configurações // Complexo, estudar e pensar bem como organizar isso

    ////////////////////////////////////////////////////////////
    // 06 - Inicializa Rota
    ////////////////////////////////////////////////////////////

    await router.setup()
  }
}
