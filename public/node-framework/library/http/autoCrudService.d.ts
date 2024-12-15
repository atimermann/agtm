import type { LoggerInterface } from "../loggers/logger.interface.js";
import { AutoSchemaHandler } from "./autoSchemaHandler.js";
export declare class AutoCrudService {
    private logger;
    private prismaIntance;
    private readonly autoSchema;
    constructor(autoSchema: AutoSchemaHandler, logger: LoggerInterface);
    /**
     * Retorna instancia do prisma com a entidade definida
     */
    get prisma(): any;
    setup(): Promise<void>;
    create(rawData: unknown): Promise<Record<string, unknown> | Record<string, unknown>[]>;
    getAll(): Promise<Record<string, unknown> | Record<string, unknown>[]>;
    get(id: unknown): Promise<any>;
    update(id: number, rawData: unknown): Promise<Record<string, unknown> | Record<string, unknown>[]>;
    delete(id: unknown): Promise<Record<string, unknown> | Record<string, unknown>[]>;
    getCrudSchema(): Promise<import("./crudSchema.interface.js").CrudSchema>;
    /**
     * Importa PrismaClient do diretório do projeto do usuário
     *
     */
    private importPrismaClient;
    /**
     * Filtra o resultado de uma query para retornar apenas os campos visíveis (view = true).
     * Usado apenas no DELETE, UPDATE e CREATE, já que o get e getAll é possível definir o select.
     *
     * @param queryResult Resultado da query filtrado. Pode ser um objeto ou um array de objetos.
     * @returns Objeto filtrado ou array de objetos filtrados.
     */
    private filterResult;
    /**
     * Extrai dados do request.body
     *
     * @param isCreate  Define se a operação é de criação
     * @param body      Corpo da requisição
     */
    private loadDataFromBody;
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
    private validateRequired;
    /**
     * TODO: Valida se um campo único já existe no banco de dados
     *
     * @param field Campo a ser validado
     * @param value Valor do campo
     */
    private validateUnique;
    /**
     * Gera nova instancia à partir do caminho do schema
     */
    static createFromSchema(schemaPath: string): Promise<AutoCrudService>;
}
