/**
 * Created on 24/02/2025
 *
 * @author André Timermann <andre@timermann.com.br>
 *
 * @file
 * Classe base para criação de rota pelo usuário
 *
 */
import type { LoggerInterface } from "../loggers/logger.interface.ts"
import type { ApiControllerInterface } from "./interfaces/apiController.interface.ts"
import type {
  FastifyInstance,
  FastifyReply,
  FastifyRequest,
  FastifySchema,
  RouteOptions,
} from "fastify"
import type { UserClassFileDescription } from "./services/userApiFilesService.ts"

/**
 * Ao criar uma nova rota, é possível referenciar o method no controller ou criar um callback fastify diretamente
 */
type RouteHandler = (request: FastifyRequest, reply: FastifyReply) => Promise<any> | any

export class ApiRouter {
  private readonly logger: LoggerInterface
  private readonly server: FastifyInstance
  private readonly controller: ApiControllerInterface
  private readonly routerDescriptor?: UserClassFileDescription

  public __INSTANCE__ = "__ApiRouter"

  constructor(
    logger: LoggerInterface,
    server: FastifyInstance,
    controller: ApiControllerInterface,
    routerDescriptor?: UserClassFileDescription,
  ) {
    this.logger = logger
    this.server = server
    this.routerDescriptor = routerDescriptor
    this.controller = controller
  }

  async setup(): Promise<void> {}

  // TODO: Criar o método "all" se necessário (suporta todos os métodos)

  delete(
    url: string,
    handler: string | RouteHandler,
    schema?: FastifySchema,
    options?: Partial<RouteOptions>,
  ): this {
    this.createRoute("DELETE", url, handler, schema, options)
    return this
  }

  get(
    url: string,
    handler: string | RouteHandler,
    schema?: FastifySchema,
    options?: Partial<RouteOptions>,
  ): this {
    this.createRoute("GET", url, handler, schema, options)
    return this
  }

  post(
    url: string,
    handler: string | RouteHandler,
    schema?: FastifySchema,
    options?: Partial<RouteOptions>,
  ): this {
    this.createRoute("POST", url, handler, schema, options)
    return this
  }

  put(
    url: string,
    handler: string | RouteHandler,
    schema?: FastifySchema,
    options?: Partial<RouteOptions>,
  ): this {
    this.createRoute("PUT", url, handler, schema, options)
    return this
  }

  head(
    url: string,
    handler: string | RouteHandler,
    schema?: FastifySchema,
    options?: Partial<RouteOptions>,
  ): this {
    this.createRoute("HEAD", url, handler, schema, options)
    return this
  }

  trace(
    url: string,
    handler: string | RouteHandler,
    schema?: FastifySchema,
    options?: Partial<RouteOptions>,
  ): this {
    this.createRoute("TRACE", url, handler, schema, options)
    return this
  }

  options(
    url: string,
    handler: string | RouteHandler,
    schema?: FastifySchema,
    options?: Partial<RouteOptions>,
  ): this {
    this.createRoute("OPTIONS", url, handler, schema, options)
    return this
  }

  patch(
    url: string,
    handler: string | RouteHandler,
    schema?: FastifySchema,
    options?: Partial<RouteOptions>,
  ): this {
    this.createRoute("PATCH", url, handler, schema, options)
    return this
  }

  /**
   * Cria uma rota no servidor Fastify para o method HTTP, caminho, manipulador e esquema especificados.
   * Lança um erro se o manipulador especificado não existir no controlador.
   *
   * @param method      Method HTTP (ex.: "GET", "POST").
   * @param url         Caminho da URL para a rota.
   * @param userHandler Nome do Method no controlador ou uma função de manipulação personalizada do Fastify.
   * @param schema      Esquema de validação do Fastify.
   * @param options     Opções adicionais para a rota no Fastify.
   */
  private createRoute(
    method: string,
    url: string,
    userHandler: string | RouteHandler,
    schema?: FastifySchema,
    options?: Partial<RouteOptions>,
  ) {
    this.logger.info(`Configurando Rota ${method}: ${url}`)

    const handler: RouteHandler =
      typeof userHandler === "string" ? this.getHandlerFromController(userHandler) : userHandler

    // Ref: https://fastify.dev/docs/latest/Reference/Routes/#routes-options
    this.server.route({
      method,
      url,
      schema,
      handler,
      ...options,
    })
  }

  /**
   * Retorna um Handler de rota (Código executado quando usuário acessar uma rota especifica do controller
   *
   * @param userHandlerName Nome do method do controller que será o handler desta rota
   */
  private getHandlerFromController(userHandlerName: string): RouteHandler {
    if (!this.controller) {
      if (this.routerDescriptor) {
        throw new Error(`Controller does not exist for route "${this.routerDescriptor.name}"`)
      }

      throw new Error(
        "Severe Error: Controller does not exist for dynamic route (generated pro auto)",
      )
    }

    // @ts-ignore
    if (typeof this.controller[userHandlerName] !== "function") {
      throw new Error(`Method "${userHandlerName}" not implemented in the controller.`)
    }

    return async (request, reply) => {
      // @ts-ignore
      return await this.controller[userHandlerName](request, reply)
    }
  }
}
