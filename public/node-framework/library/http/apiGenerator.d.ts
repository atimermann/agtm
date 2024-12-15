import type { LoggerInterface } from "../loggers/logger.interface.js";
import type { UserClassFileDescription } from "./httpServer2.js";
import type { FastifyInstance } from "fastify";
export default class ApiGenerator {
    protected logger: LoggerInterface;
    protected readonly server: FastifyInstance;
    constructor(logger: LoggerInterface, server: FastifyInstance);
    /**
     * Gera uma nova API completa automaticamente baseado no schema
     *
     * @param fileDescription
     */
    generate(fileDescription: UserClassFileDescription): Promise<void>;
    /**
     * Importa e instancia a classe do router existente.
     * TODO: Tratar tipo correto do httpSchema
     * @param routerPath
     * @param controllerInstance
     * @param httpSchema
     */
    private loadAndInitializeRouter;
    /**
     * Importa e iniciancia novos controllers (Gerado automaticamente ou userspace)
     *
     * @param controllerPath
     * @param autoSchema
     */
    private loadAndInitializeApiController;
}
