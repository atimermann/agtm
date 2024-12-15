/**
 * Controller base, gera rota dinamicas
 */
import type { FastifyReply, FastifyRequest } from "fastify";
import type { LoggerInterface } from "../loggers/logger.interface.js";
import type { AutoSchemaHandler } from "./autoSchemaHandler.js";
export declare class ApiController {
    private readonly autoSchema;
    private logger;
    private autoCrudService;
    __INSTANCE__: string;
    constructor(autoSchema: AutoSchemaHandler, logger: LoggerInterface);
    /**
     * Configuração inicial do controller
     */
    setup(): Promise<void>;
    /**
     * Controller padrão para criar novo registro
     */
    create(request: FastifyRequest): Promise<Record<string, unknown> | Record<string, unknown>[]>;
    /**
     * Controller padrão para retornar todos os registros
     *
     **/
    getAll(): Promise<Record<string, unknown> | Record<string, unknown>[]>;
    /**
     * Controller padrão para retornar um registro baseado no id
     */
    get(request: FastifyRequest, reply: FastifyReply): Promise<any>;
    /**
     * Controller padrão para atualizar registro automaticamente
     **/
    update(request: FastifyRequest, reply: FastifyReply): Promise<Record<string, unknown> | Record<string, unknown>[]>;
    /**
     * Remove registro
     */
    delete(request: FastifyRequest, reply: FastifyReply): Promise<Record<string, unknown> | Record<string, unknown>[]>;
    /**
     * Gera um CrudSchema usado pelo front end para gerar crud automaticamente
     */
    schema(): Promise<import("./crudSchema.interface.js").CrudSchema>;
}
