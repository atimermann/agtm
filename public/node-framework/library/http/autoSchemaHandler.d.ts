import type { AutoSchema } from "./autoSchema.interface.js";
import type { UserClassFileDescription } from "./httpServer2.js";
import type { CrudSchema } from "./crudSchema.interface.js";
export declare class AutoSchemaHandler {
    readonly schema: AutoSchema;
    static createFromFile(fileDescription: UserClassFileDescription): Promise<AutoSchemaHandler>;
    protected static loadSchema(fileDescription: UserClassFileDescription): Promise<AutoSchema>;
    constructor(schema: AutoSchema);
    /**
     * Get the list of fields from the schema.
     */
    getCreateFieldsName(): string[];
    /**
     * Returns list of fields configured to return to user
     */
    generateSelectField(): {};
    /**
     * Retorna lista de campos configurado para ser exibido na view
     *
     * @param key Força retorno do valor da chave primária
     */
    getViewFields(key?: boolean): string[];
    /**
     * Mapeia o formato padrão Auto SChema para o formato de schema utilizado pelo Crud do Frontend
     * TODO: Conerter o método em um mapper
     */
    mapAutoSchemaToCrudSchema(): CrudSchema;
}
