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
import type { LoggerInterface } from "../../loggers/logger.interface.ts"

export class SwaggerPlugin {
  private readonly server: FastifyInstance
  private readonly logger: LoggerInterface

  constructor(server: FastifyInstance, logger: LoggerInterface) {
    this.server = server
    this.logger = logger
  }

  async setup() {
    try {
      // Referencia de documentação: https://swagger.io/specification/#schema-1
      await this.server.register(import("@fastify/swagger"), {
        openapi: {
          openapi: "3.0.0",
          // https://swagger.io/specification/#info-object
          info: {
            title: "Node Framework",
            summary: "API documentation",
            description: "Api de teste para node framework",
            version: "0.1.0",
          },
          externalDocs: {
            url: "https://swagger.io",
            description: "Find more info here",
          },
        },
      })

      // Refêrencia de documentação: https://github.com/fastify/fastify-swagger-ui?tab=readme-ov-file#api
      await this.server.register(import("@fastify/swagger-ui"), {
        theme: {
          title: "Node Framework",
        },
        routePrefix: "/docs",
        uiConfig: {
          docExpansion: "none",
          deepLinking: false,
        },
        uiHooks: {
          onRequest: function (request, reply, next) {
            next()
          },
          preHandler: function (request, reply, next) {
            next()
          },
        },
        staticCSP: true,
        transformStaticCSP: (header) => header,
        transformSpecification: (swaggerObject, request, reply) => {
          return swaggerObject
        },
        transformSpecificationClone: true,
      })
    } catch (error: any) {
      this.logger.error(`Error registering Swagger plugin: ${error.message}`)
    }
  }
}
