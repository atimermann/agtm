/**
 * Controller base, gera rota dinamicas
 */
import { AutoCrudService } from "./autoCrudService.js";
export class ApiController {
    autoSchema;
    logger;
    autoCrudService;
    __INSTANCE__ = "__HttpController";
    constructor(autoSchema, logger) {
        this.autoSchema = autoSchema;
        this.logger = logger;
        this.autoCrudService = new AutoCrudService(autoSchema, logger);
    }
    /**
     * Configuração inicial do controller
     */
    async setup() {
        await this.autoCrudService.setup();
    }
    /**
     * Controller padrão para criar novo registro
     */
    async create(request) {
        return this.autoCrudService.create(request.body);
    }
    /**
     * Controller padrão para retornar todos os registros
     *
     **/
    async getAll() {
        return this.autoCrudService.getAll();
    }
    /**
     * Controller padrão para retornar um registro baseado no id
     */
    async get(request, reply) {
        const { id } = request.params;
        const entity = this.autoCrudService.get(id);
        // TODO: usar erro padronizado estudar no fastify
        if (!entity) {
            return reply.status(404).send({
                error: "Not Found",
                message: `Route GET:${request.url} not found`,
            });
        }
        return entity;
    }
    /**
     * Controller padrão para atualizar registro automaticamente
     **/
    async update(request, reply) {
        const { id } = request.params;
        try {
            return this.autoCrudService.update(id, request.body);
        }
        catch (error) {
            if (error.code === "P2025") {
                // TODO: usar erro padronizado estudar no fastify
                return reply.status(404).send({
                    error: "Not Found",
                });
            }
            throw error;
        }
    }
    /**
     * Remove registro
     */
    async delete(request, reply) {
        const { id } = request.params;
        try {
            return this.autoCrudService.delete(id);
        }
        catch (error) {
            if (error.code === "P2025") {
                // TODO: usar erro padronizado estudar no fastify
                return reply.status(404).send("Not Found");
            }
            throw error;
        }
    }
    /**
     * Gera um CrudSchema usado pelo front end para gerar crud automaticamente
     */
    async schema() {
        return this.autoCrudService.getCrudSchema();
    }
}
