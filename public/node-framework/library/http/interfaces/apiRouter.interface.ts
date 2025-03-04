import type {
  FastifyInstance,
  FastifyReply,
  FastifyRequest,
  FastifySchema,
  RouteOptions,
} from "fastify"

/**
 * Type representing a route handler function.
 *
 * @param {FastifyRequest} request - Fastify request object.
 * @param {FastifyReply} reply - Fastify reply object.
 * @returns {Promise<any> | any} Response or promise resolving to a response.
 */
export type RouteHandler = (
  request: FastifyRequest,
  reply: FastifyReply
) => Promise<any> | any

/**
 * Interface for the ApiRouter class.
 *
 * Provides the public methods to define routes on a Fastify server.
 */
export interface ApiRouterInterface {
  __INSTANCE__: string

  /**
   * Setup method to initialize routes.
   */
  setup(): Promise<void>

  /**
   * Defines a DELETE route.
   *
   * @param {string} url - The URL path for the route.
   * @param {string | RouteHandler} handler - The name of the controller method or a custom handler function.
   * @param {FastifySchema} [schema] - The Fastify validation schema.
   * @param {Partial<RouteOptions>} [options] - Additional route options.
   *
   * @returns {this} The ApiRouter instance.
   */
  delete(
    url: string,
    handler: string | RouteHandler,
    schema?: FastifySchema,
    options?: Partial<RouteOptions>
  ): this

  /**
   * Defines a GET route.
   *
   * @param {string} url - The URL path for the route.
   * @param {string | RouteHandler} handler - The name of the controller method or a custom handler function.
   * @param {FastifySchema} [schema] - The Fastify validation schema.
   * @param {Partial<RouteOptions>} [options] - Additional route options.
   *
   * @returns {this} The ApiRouter instance.
   */
  get(
    url: string,
    handler: string | RouteHandler,
    schema?: FastifySchema,
    options?: Partial<RouteOptions>
  ): this

  /**
   * Defines a POST route.
   *
   * @param {string} url - The URL path for the route.
   * @param {string | RouteHandler} handler - The name of the controller method or a custom handler function.
   * @param {FastifySchema} [schema] - The Fastify validation schema.
   * @param {Partial<RouteOptions>} [options] - Additional route options.
   *
   * @returns {this} The ApiRouter instance.
   */
  post(
    url: string,
    handler: string | RouteHandler,
    schema?: FastifySchema,
    options?: Partial<RouteOptions>
  ): this

  /**
   * Defines a PUT route.
   *
   * @param {string} url - The URL path for the route.
   * @param {string | RouteHandler} handler - The name of the controller method or a custom handler function.
   * @param {FastifySchema} [schema] - The Fastify validation schema.
   * @param {Partial<RouteOptions>} [options] - Additional route options.
   *
   * @returns {this} The ApiRouter instance.
   */
  put(
    url: string,
    handler: string | RouteHandler,
    schema?: FastifySchema,
    options?: Partial<RouteOptions>
  ): this

  /**
   * Defines a HEAD route.
   *
   * @param {string} url - The URL path for the route.
   * @param {string | RouteHandler} handler - The name of the controller method or a custom handler function.
   * @param {FastifySchema} [schema] - The Fastify validation schema.
   * @param {Partial<RouteOptions>} [options] - Additional route options.
   *
   * @returns {this} The ApiRouter instance.
   */
  head(
    url: string,
    handler: string | RouteHandler,
    schema?: FastifySchema,
    options?: Partial<RouteOptions>
  ): this

  /**
   * Defines a TRACE route.
   *
   * @param {string} url - The URL path for the route.
   * @param {string | RouteHandler} handler - The name of the controller method or a custom handler function.
   * @param {FastifySchema} [schema] - The Fastify validation schema.
   * @param {Partial<RouteOptions>} [options] - Additional route options.
   * @returns {this} The ApiRouter instance.
   */
  trace(
    url: string,
    handler: string | RouteHandler,
    schema?: FastifySchema,
    options?: Partial<RouteOptions>

  ): this

  /**
   * Defines an OPTIONS route.
   *
   * @param {string} url - The URL path for the route.
   * @param {string | RouteHandler} handler - The name of the controller method or a custom handler function.
   * @param {FastifySchema} [schema] - The Fastify validation schema.
   * @param {Partial<RouteOptions>} [options] - Additional route options.
   *
   * @returns {this} The ApiRouter instance.
   */
  options(
    url: string,
    handler: string | RouteHandler,
    schema?: FastifySchema,
    options?: Partial<RouteOptions>
  ): this

  /**
   * Defines a PATCH route.
   *
   * @param {string} url - The URL path for the route.
   * @param {string | RouteHandler} handler - The name of the controller method or a custom handler function.
   * @param {FastifySchema} [schema] - The Fastify validation schema.
   * @param {Partial<RouteOptions>} [options] - Additional route options.
   *
   * @returns {this} The ApiRouter instance.
   */
  patch(
    url: string,
    handler: string | RouteHandler,
    schema?: FastifySchema,
    options?: Partial<RouteOptions>
  ): this
}
