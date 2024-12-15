/**
 * Fastify Router reference: https://fastify.dev/docs/latest/Reference/Routes/#full-declaration
 *
 * URL Builder: https://fastify.dev/docs/latest/Reference/Routes/#url-building
 *
 */
import type { HttpRouterInterface } from "./httpRouter.interface.js";
import type { FastifyInstance } from "fastify";
import type { LoggerInterface } from "../loggers/logger.interface.js";
import type { AutoToHttpSchemaMapper } from "./mapper/autoToHttpSchemaMapper.js";
import type { ApiController } from "./apiController.js";
export declare class HttpRouter implements HttpRouterInterface {
    protected readonly logger: LoggerInterface;
    protected readonly server: FastifyInstance;
    protected controller: ApiController;
    protected httpSchema: AutoToHttpSchemaMapper;
    constructor(server: FastifyInstance, logger: LoggerInterface, controller: ApiController, httpSchema: AutoToHttpSchemaMapper);
    setup(): Promise<void>;
    delete(path: string, handlerName: string): this;
    get(url: string, handlerName: string): this;
    post(path: string, handlerName: string): this;
    put(path: string, handlerName: string): this;
    head(path: string, handlerName: string): this;
    trace(path: string, handlerName: string): this;
    options(path: string, handlerName: string): this;
    patch(path: string, handlerName: string): this;
    /**
     * O schema é dividido em vários subsquemas, entre eles o $common que é um schema que pode ser reaproveitado em outros schemas
     *
     * Ref: https://fastify.dev/docs/latest/Reference/Validation-and-Serialization/#validation-and-serialization
     *
     * O common é carregado com addSchema e com id gerado automaticamente apartir de routerDescription.id
     */
    /**
     * Creates a route in the Fastify server for the specified method, path, and handler name.
     * Throws an error if the specified handler does not exist in the controller.
     */
    private createRoute;
}
