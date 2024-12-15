import { join } from "node:path";
import { AutoSchemaHandler } from "./autoSchemaHandler.js";
import ConsoleLogger from "../loggers/consoleLogger.js";
export class AutoCrudService {
    logger;
    prismaIntance;
    autoSchema;
    constructor(autoSchema, logger) {
        this.autoSchema = autoSchema;
        this.logger = logger;
    }
    /**
     * Retorna instancia do prisma com a entidade definida
     */
    get prisma() {
        return this.prismaIntance[this.autoSchema.schema.model];
    }
    async setup() {
        this.prismaIntance = await this.importPrismaClient();
    }
    async create(rawData) {
        const data = await this.loadDataFromBody(true, rawData);
        this.logger.debug(`Create "${this.autoSchema.schema.model}":\n "${JSON.stringify(data, undefined, "  ")}"`);
        const queryResult = await this.prisma.create({ data });
        return this.filterResult(queryResult);
    }
    async getAll() {
        const modelName = this.autoSchema.schema.model;
        const queryResult = await this.prismaIntance[modelName].findMany({
            select: this.autoSchema.generateSelectField(),
            where: { deletedAt: null },
        });
        return this.filterResult(queryResult);
    }
    async get(id) {
        return await this.prisma.findFirst({
            select: this.autoSchema.generateSelectField(),
            where: { id, deletedAt: null },
        });
    }
    async update(id, rawData) {
        const data = await this.loadDataFromBody(false, rawData);
        const queryResult = await this.prisma.update({
            data: {
                ...data,
                updatedAt: new Date(),
            },
            where: { id, deletedAt: null },
        });
        return this.filterResult(queryResult);
    }
    async delete(id) {
        const queryResult = await this.prisma.update({
            where: { id, deletedAt: null },
            data: { deletedAt: new Date() },
        });
        return this.filterResult(queryResult);
    }
    async getCrudSchema() {
        return this.autoSchema.mapAutoSchemaToCrudSchema();
    }
    /**
     * Importa PrismaClient do diretório do projeto do usuário
     *
     */
    async importPrismaClient() {
        const pathToPrismaClient = join(process.cwd(), "node_modules", "@prisma/client");
        const PrismaClient = (await import(`${pathToPrismaClient}/default.js`)).PrismaClient;
        return new PrismaClient({
            log: ["query", "info", "warn", "error"],
        });
    }
    /**
     * Filtra o resultado de uma query para retornar apenas os campos visíveis (view = true).
     * Usado apenas no DELETE, UPDATE e CREATE, já que o get e getAll é possível definir o select.
     *
     * @param queryResult Resultado da query filtrado. Pode ser um objeto ou um array de objetos.
     * @returns Objeto filtrado ou array de objetos filtrados.
     */
    filterResult(queryResult) {
        if (Array.isArray(queryResult)) {
            return queryResult.map((item) => this.filterResult(item));
        }
        return Object.fromEntries(Object.entries(queryResult).filter(([key]) => {
            return this.autoSchema.getViewFields().includes(key);
        }));
    }
    /**
     * Extrai dados do request.body
     *
     * @param isCreate  Define se a operação é de criação
     * @param body      Corpo da requisição
     */
    async loadDataFromBody(isCreate, body) {
        const data = {};
        for (const field of this.autoSchema.schema.fields) {
            // Ignora campos create ou update
            if (isCreate && field.create === false)
                continue;
            if (!isCreate && field.update === false)
                continue;
            const value = body[field.name];
            this.validateRequired(isCreate, field, value);
            if (value === undefined)
                continue;
            await this.validateUnique(field, value);
            /**
             * Tratamento relation N-1:
             * REF: https://www.prisma.io/docs/orm/prisma-schema/data-model/relations#associate-an-existing-record-to-another-existing-record
             */
            if (field.relation) {
                data[field.relation] = {
                    connect: {
                        id: body[field.name],
                    },
                };
                continue;
            }
            data[field.dbName || field.name] = body[field.name];
        }
        return data;
    }
    /**
     *  Validação de campos obrigatório para a base de dados
     *  Se undefined no modo update o campo será ignorado então ok
     *  Null sempre valida
     *
     *  NOTA: Gera apenas validações simples
     *
     * @param isCreate  Define se a operação é de criação
     * @param field     Campo a ser validado
     * @param value     Valor do campo
     */
    validateRequired(isCreate, field, value) {
        // TODO: Tentar usar um gerador de erro padrão, para retornar no padrão do fastify (ou criar se nao existir)
        if (field.required && isCreate && (value === undefined || value === null)) {
            throw new Error(`The "${field.name}" field is required.`);
        }
        if (field.required && !isCreate && value === null) {
            throw new Error(`The "${field.name}" field is required.`);
        }
    }
    /**
     * TODO: Valida se um campo único já existe no banco de dados
     *
     * @param field Campo a ser validado
     * @param value Valor do campo
     */
    async validateUnique(field, value) {
        if (field.unique) {
            // TODO: Validar se o registro já existe
        }
    }
    /**
     * Gera nova instancia à partir do caminho do schema
     */
    static async createFromSchema(schemaPath) {
        const logger = new ConsoleLogger();
        const fileDescription = {
            app: "",
            id: "",
            path: schemaPath,
        };
        const autoSchema = await AutoSchemaHandler.createFromFile(fileDescription);
        const service = new AutoCrudService(autoSchema, logger);
        await service.setup();
        return service;
    }
}
