/**
 * Created on 28/02/2025
 *
 * @author André Timermann <andre@timermann.com.br>
 *
 * @file
 * Plugin que configura o swagger para documentação automática
 *
 */
import type { FastifyInstance } from "fastify"
import type { LoggerInterface } from "#/loggers/logger.interface.js"
import type { SwaggerConfig } from "#/http/interfaces/swaggerConfig.interface.js"

import ValidatorByInterface from "#/utils/validatorByInterface.js"
import { ConfigService } from "#/services/configService.js"

const swaggerConfigValidator = new ValidatorByInterface(
  "library/http/interfaces/swaggerConfig.interface.ts",
  "SwaggerConfig",
)

export class SwaggerPlugin {
  private readonly fastify: FastifyInstance
  private readonly logger: LoggerInterface
  private readonly swaggerConfig: SwaggerConfig
  private config: ConfigService

  constructor(logger: LoggerInterface, config: ConfigService, fastify: FastifyInstance, swaggerConfig?: SwaggerConfig) {
    this.fastify = fastify
    this.logger = logger
    this.config = config
    this.swaggerConfig = swaggerConfig ?? config.getYaml("swagger")
    swaggerConfigValidator.validate(this.swaggerConfig, this.logger)
  }

  /**
   * Adiciona uma nova tag à configuração OpenAPI do Swagger
   *
   * @param name        Nome da tag
   * @param description Descrição da tag
   */
  addTag(name: string, description: string) {
    if (!this.swaggerConfig.openapi.tags) {
      this.swaggerConfig.openapi.tags = []
    }

    // Verifica se a tag já existe
    const exists = this.swaggerConfig.openapi.tags.some((tag) => tag.name === name)
    if (exists) {
      this.logger.debug(`A tag '${name}' já existe.`)
      return
    }
    this.swaggerConfig.openapi.tags.push({ name, description })
  }

  async setup() {
    try {
      // ################################################################################################################
      //       PAREI AQUI
      //
      //       - precisamos adicionar configuração para habilitar ou não o swagger
      //       - configuação para definir rota padrão
      //       - Existem muitas configurações no swagger, pensar melhor maneira de documentar, não é caso de usar variavel de ambiente é caso de uma configuração fixa
      //       => Pode ser YAML no sistema padrão ou criar uma configuração json só pro swagger ou ainda criar uma configuração simplificada
      //       => configuração de rotas especificas vai vir da configuração da rota q pode ser gerado automaticamente
      // TEM Q SER SIMPLES
      // ################################################################################################################

      // Referencia de documentação: https://swagger.io/specification/#schema-1
      await this.fastify.register(import("@fastify/swagger"), {
        openapi: this.swaggerConfig.openapi as any,
      })

      // Refêrencia de documentação: https://github.com/fastify/fastify-swagger-ui?tab=readme-ov-file#api
      await this.fastify.register(import("@fastify/swagger-ui"), {
        routePrefix: this.swaggerConfig.routePrefix,
        theme: this.swaggerConfig.theme,
        uiConfig: this.swaggerConfig.uiConfig as any,
        // uiHooks: {
        //   onRequest: function (request, reply, next) {
        //     next()
        //   },
        //   preHandler: function (request, reply, next) {
        //     next()
        //   },
        // },
        // staticCSP: true,
        // transformStaticCSP: (header) => header,
        // transformSpecification: (swaggerObject, request, reply) => {
        //   return swaggerObject
        // },
        // transformSpecificationClone: true,
      })
    } catch (error: any) {
      this.logger.error(`Error registering Swagger plugin: ${error.message}`)
    }
  }
}
