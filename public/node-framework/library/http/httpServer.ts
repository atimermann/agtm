/**
 * Created on 16/02/2025
 *
 * @author André Timermann <andre@timermann.com.br>
 *
 * @file
 * Servidor HTTP para criação apis com fastify
 *
 */
import type LoggerService from "../services/loggerService.ts"
import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify"

import RouteService from "./services/routeService.ts"
import Fastify from "fastify"
import cors from "@fastify/cors"

import { SwaggerPlugin } from "./plugins/swagger.ts"
import ErrorHandlerService from "./services/errorHandlerService.ts"

export default class HttpServer {
  private readonly logger: LoggerService
  private readonly fastify: FastifyInstance
  private readonly router: RouteService
  private readonly swaggerPlugin: SwaggerPlugin
  private readonly errorHandlerService: ErrorHandlerService

  constructor(
    logger: LoggerService,
    server?: FastifyInstance,
    router?: RouteService,
    swaggerPlugin?: SwaggerPlugin,
    errorHandlerService?: ErrorHandlerService,
  ) {
    this.logger = logger

    // Configura Fastify, reutilizando o logger fornecido
    this.fastify =
      server ??
      Fastify({
        logger: true,
        ajv: {
          customOptions: {
            // Permite exibir todos os erros de validação
            allErrors: true,
          },
        },
      })

    this.swaggerPlugin = swaggerPlugin ?? new SwaggerPlugin(this.fastify, this.logger)
    this.errorHandlerService = errorHandlerService ?? new ErrorHandlerService(this.logger)
    this.router = router ?? new RouteService(logger, this.fastify, this.swaggerPlugin)
  }

  /**
   * Inicia o servidor HTTP, configurando CORS, rotas e iniciando o servidor.
   */
  async run() {
    await this.swaggerPlugin.setup()
    await this.configureCors()

    await this.configureErrorHandler()

    await this.createPingRoute()
    await this.router.createRoutes()
    await this.createInfoRoute()

    await this.fastify.ready()
    await this.runServer()
  }

  /**
   * Configura o CORS para permitir requisições de origens variadas.
   */
  private async configureCors() {
    await this.fastify.register(cors, {
      // Permite todas as origens, TODO: parametrizar CORS
      origin: true,
    })
  }

  /**
   * Cria a rota `/ping`, que serve como teste para verificar se o servidor está rodando.
   */
  private async createPingRoute() {
    this.fastify.get("/ping", async (request, reply) => {
      return {
        message: "Server is running!",
        time: reply.elapsedTime,
        ip: request.ip,
        protocol: request.protocol,
      }
    })
  }

  /**
   * Inicia o servidor na porta configurada.
   * Em caso de erro, encerra o processo com código de saída `1`.
   */
  private async runServer() {
    try {
      // TODO: parametrizar no ENV
      const port = 3001

      await this.fastify.listen({ port, host: "0.0.0.0" })
      this.logger.info(`Server started on http://0.0.0.0:${port}`)
    } catch (err) {
      this.logger.error("Error starting server: " + err)
      process.exit(1)
    }
  }

  /**
   * Cria a rota `/info`, que deve exibir informações detalhadas do servidor.
   * TODO: Proteger esta rota para evitar exposição de informações sensíveis.
   */
  private async createInfoRoute() {
    this.fastify.get("/info", async (request, reply) => {
      return "TODO: Exibe todos os dados das rotas, controllers, schemas carregado para depuração"
    })
  }

  /**
   * Configura o Manipulador de Erros
   */
  private async configureErrorHandler() {
    this.fastify.setErrorHandler(
      (error: Error & { validation?: any[] }, request: FastifyRequest, reply: FastifyReply) => {
        this.errorHandlerService.handleError(error, request, reply)
      },
    )
  }
}
