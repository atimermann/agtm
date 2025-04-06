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
import type { FastifyInstance, FastifyReply, FastifyRequest, FastifySchema, RouteHandler, RouteOptions } from "fastify"
import type { UserClassFileDescription } from "./services/userApiFilesService.ts"
import type { IApiRouteOption } from "#/http/interfaces/IApiRouteOption.js"
import type { ApiController } from "#/http/apiController.js"

/**
 * Ao criar uma nova rota, é possível referenciar o method no controller ou criar um callback fastify diretamente
 */

/**
 * @param method      Method HTTP (ex.: "GET", "POST").
 * @param url         Caminho da URL para a rota.
 * @param userHandler Nome do Method no controlador ou uma função de manipulação personalizada do Fastify.
 * @param schema      Esquema de validação do Fastify.
 * @param options     Opções adicionais para a rota no Fastify.s
 */
interface RouteConfig {
  method: string
  url: string
  handler: string | RouteHandler
  schema?: FastifySchema
  options?: Partial<IApiRouteOption>
}

export class ApiRouter {
  public __INSTANCE__ = "__ApiRouter"

  private routes: RouteConfig[] = []

  constructor(
    protected readonly logger: LoggerInterface,
    protected readonly fastify: FastifyInstance,
    protected readonly controller: ApiController,
    protected readonly appName: string,
    protected readonly routerDescriptor?: UserClassFileDescription,
  ) {}

  async setup(): Promise<void> {}

  /**
   * Registra todas as rotas armazenadas no array no servidor Fastify.
   *
   * Este método deve ser chamado após a configuração de todas as rotas.
   */
  public run(): void {
    for (const route of this.routes) {
      this.createRoute(route)
    }
  }

  get lastRoute() {
    return this.routes[this.routes.length - 1]
  }

  // TODO: Criar o método "all" se necessário (suporta todos os métodos)

  // Métodos para registrar rotas (não criam a rota imediatamente, apenas armazenam a configuração)
  delete(url: string, handler: string | RouteHandler, schema?: FastifySchema, options?: Partial<RouteOptions>): this {
    this.addRoute("DELETE", url, handler, schema, options)
    return this
  }

  get(url: string, handler: string | RouteHandler, schema?: FastifySchema, options?: Partial<RouteOptions>): this {
    this.addRoute("GET", url, handler, schema, options)
    return this
  }

  post(url: string, handler: string | RouteHandler, schema?: FastifySchema, options?: Partial<RouteOptions>): this {
    this.addRoute("POST", url, handler, schema, options)
    return this
  }

  put(url: string, handler: string | RouteHandler, schema?: FastifySchema, options?: Partial<RouteOptions>): this {
    this.addRoute("PUT", url, handler, schema, options)
    return this
  }

  head(url: string, handler: string | RouteHandler, schema?: FastifySchema, options?: Partial<RouteOptions>): this {
    this.addRoute("HEAD", url, handler, schema, options)
    return this
  }

  trace(url: string, handler: string | RouteHandler, schema?: FastifySchema, options?: Partial<RouteOptions>): this {
    this.addRoute("TRACE", url, handler, schema, options)
    return this
  }

  options(url: string, handler: string | RouteHandler, schema?: FastifySchema, options?: Partial<RouteOptions>): this {
    this.addRoute("OPTIONS", url, handler, schema, options)
    return this
  }

  patch(url: string, handler: string | RouteHandler, schema?: FastifySchema, options?: Partial<RouteOptions>): this {
    this.addRoute("PATCH", url, handler, schema, options)
    return this
  }

  /**
   * Define a configuração da ultima rota não precisa ser autorizada ou seja é publica
   *
   * Para isso precisamos definir config.auth = false que será lido pelo plugin keycloak, se auth = false libera
   * Nota, vamos deixar explicito para evitar problema de esquecer e deixar uma rota aberta
   *
   * TODO: No futuro podemos jogar esse método para dentro do plugin "library/http/plugins/keycloak.ts"
   *
   */
  public() {
    this.lastRoute.options = {
      ...this.lastRoute.options,
      config: {
        auth: false,
      },
    }
    return this
  }

  /**
   * Define a configuração da ultima rota como deve ser autorizada
   * Para isso precisamos definor config.auth = true que será lido pelo plugin keycloak, se auth = true ele só autoriza
   * execução da rota se usuário estivar autenticado
   *
   * TODO: No futuro podemos jogar esse método para dentro do plugin "library/http/plugins/keycloak.ts"
   *
   * @param roles Se definido a rota também será validada à partir da lista de roles (permissões) definida
   */
  auth(roles: string[] = []) {
    this.lastRoute.options = {
      ...this.lastRoute.options,
      config: {
        auth: true,
        roles,
      },
    }
    return this
  }

  /**
   * Armazena a configuração da rota em um array para criação posterior.
   *
   * @param method      Método HTTP (ex.: "GET", "POST").
   * @param url         Caminho da URL para a rota.
   * @param handler     Nome do método no controller ou uma função de manipulação personalizada do Fastify.
   * @param schema      Esquema de validação do Fastify.
   * @param options     Opções adicionais para a rota no Fastify.
   */
  private addRoute(
    method: string,
    url: string,
    handler: string | RouteHandler,
    schema?: FastifySchema,
    options?: Partial<RouteOptions>,
  ): void {
    this.logger.info(`Rota configurada adicionada: ${method} ${url}`)
    this.routes.push({
      method,
      url,
      handler,
      schema,
      options: {
        config: {
          auth: null,
        },
        ...options,
      },
    })
  }

  /**
   * Cria uma rota no servidor Fastify para o method HTTP, caminho, manipulador e esquema especificados.
   * Lança um erro se o manipulador especificado não existir no controlador.
   *
   * @param routeConfig
   */
  private createRoute(routeConfig: RouteConfig) {
    this.logger.info(`Configurando Rota ${routeConfig.method}: ${routeConfig.url}`)
    const handler: RouteHandler =
      typeof routeConfig.handler === "string" ? this.getHandlerFromController(routeConfig.handler) : routeConfig.handler
    // Ref: https://fastify.dev/docs/latest/Reference/Routes/#routes-options
    this.fastify.route({
      method: routeConfig.method,
      url: routeConfig.url,
      schema: routeConfig.schema,
      handler,
      ...routeConfig.options,
    })
  }

  /**
   * Retorna um Handler de rota (Código executado quando usuário acessar uma rota especifica do controller)
   *
   * @param userHandlerName Nome do method do controller que será o handler desta rota
   */
  private getHandlerFromController(userHandlerName: string): RouteHandler {
    if (!this.controller) {
      if (this.routerDescriptor) {
        throw new Error(`Controller does not exist for route "${this.routerDescriptor.name}"`)
      }

      throw new Error("Severe Error: Controller does not exist for dynamic route (generated pro auto)")
    }

    if (typeof this.controller[userHandlerName] !== "function") {
      throw new Error(`Method "${userHandlerName}" not implemented in the controller.`)
    }

    return async (request, reply): Promise<RouteHandler> => {
      return await this.controller[userHandlerName](request, reply)
    }
  }
}
