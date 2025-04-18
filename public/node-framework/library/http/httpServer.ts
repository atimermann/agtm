/**
 * Created on 16/02/2025
 *
 * @author André Timermann <andre@timermann.com.br>
 *
 * @file
 * Servidor HTTP para criação apis com fastify
 *
 */
import type { LoggerService } from "../services/loggerService.ts"
import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify"

import { RouterService } from "./services/routerService.ts"
import Fastify from "fastify"
import cors from "@fastify/cors"

import { SwaggerPlugin } from "./plugins/swagger.ts"
import ErrorHandlerService from "./services/errorHandlerService.ts"
import { KeycloakPlugin } from "#/http/plugins/keycloak.ts"
import type { RFC7807Error } from "#/http/interfaces/RFC7807Error.js"
import type { ConfigService } from "#/services/configService.js"
import type { PrismaService } from "#/services/prismaService.js"
import Ajv from "ajv"
import fastUri from "fast-uri"

export class HttpServer {
  private readonly fastify: FastifyInstance
  private readonly router: RouterService
  private readonly swaggerPlugin: SwaggerPlugin
  private readonly errorHandlerService: ErrorHandlerService
  private readonly keyCloakPlugin: KeycloakPlugin

  constructor(
    private readonly logger: LoggerService,
    private readonly config: ConfigService,
    private readonly prismaService: PrismaService,
    fastify?: FastifyInstance,
    router?: RouterService,
    swaggerPlugin?: SwaggerPlugin,
    keyCloakPlugin?: KeycloakPlugin,
    errorHandlerService?: ErrorHandlerService,
  ) {
    // Configura Fastify, reutilizando o logger fornecido
    this.fastify =
      fastify ??
      Fastify({
        logger: true,
        ajv: {
          customOptions: {
            // Permite exibir todos os erros de validação
            allErrors: true,
          },
        },
      })

    // TODO: criar um método de configuração do fastify
    // --------------- Configuração do fastify para o validador não remover campos adicionais ---------------
    // Agora se usuário adicionar mais informações q necessário será tratado
    // @ts-expect-error TS2351: This expression is not constructable.
    const ajv = new Ajv({
      coerceTypes: "array", // change data type of data to match type keyword
      useDefaults: true, // replace missing properties and items with the values from corresponding default keyword
      removeAdditional: false, // remove additional properties if additionalProperties is set to false, see: https://ajv.js.org/guide/modifying-data.html#removing-additional-properties
      uriResolver: fastUri,
      addUsedSchema: false,
      // Explicitly set allErrors to `false`.
      // When set to `true`, a DoS attack is possible.
      allErrors: false,
    })

    this.fastify.setValidatorCompiler(({ schema, method, url, httpPart }) => {
      return ajv.compile(schema)
    })
    // --------------- Configuração do fastify para o validador não remover campos adicionais ---------------

    // Plugins
    this.swaggerPlugin = swaggerPlugin ?? new SwaggerPlugin(this.logger, this.config, this.fastify)
    this.keyCloakPlugin = keyCloakPlugin ?? new KeycloakPlugin(this.logger, this.config, this.fastify)

    // Services
    this.errorHandlerService = errorHandlerService ?? new ErrorHandlerService(this.logger)
    this.router = router ?? new RouterService(logger, this.config, this.prismaService, this.fastify, this.swaggerPlugin)
  }

  /**
   * Inicia o servidor HTTP, configurando CORS, rotas e iniciando o servidor.
   */
  async run() {
    await this.configurePlugins()
    await this.configureCors()

    await this.configureErrorHandler()

    await this.createPingRoute()
    await this.router.createRoutes()
    await this.createInfoRoute()

    await this.fastify.ready()
    await this.runServer()
  }

  /**
   * Configuração plugins do Servidor
   */
  private async configurePlugins() {
    if (this.config.get("swagger.enabled", "boolean")) {
      await this.swaggerPlugin.setup()
    }

    if (this.config.get("httpServer2.plugins.keycloak.enabled", "boolean")) {
      await this.keyCloakPlugin.setup()
    }
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
      (error: Error | RFC7807Error, request: FastifyRequest, reply: FastifyReply) => {
        this.errorHandlerService.handleError(error, request, reply)
      },
    )
  }
}
