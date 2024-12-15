import type { AutoSchemaHandler } from "../autoSchemaHandler.js";
export declare class AutoToHttpSchemaMapper {
    private autoSchema;
    constructor(schema: AutoSchemaHandler);
    /**
     * Gera todos os schemas de validação e serialização utilizado pelo Fastify a partir do AutoSchema
     *
     * REF: https://fastify.dev/docs/latest/Reference/Validation-and-Serialization/#validation
     */
    mapSchema(): {
        dynamicCreate: {
            body: object;
            query: any;
            params: any;
            header: any;
        };
        dynamicGetAll: any;
        dynamicGet: {
            body: any;
            query: any;
            params: object;
            header: any;
        };
        dynamicUpdate: {
            body: object;
            query: any;
            params: object;
            header: any;
        };
        dynamicDelete: {
            body: any;
            query: any;
            params: object;
            header: any;
        };
        dynamicSchema: any;
    };
    /**
     * Converte o schema de fields para o formato JSON Schema do Fastify
     */
    private mapBody;
    /**
     * Define os parametros usados para filtrar dados, o padrão é ID
     * @private
     */
    private mapParam;
    /**
     * Mapeia os tipos do AutoSchema para os tipos suportados pelo JSON Schema do Fastify
     * REF: https://json-schema.org/understanding-json-schema/reference/type
     */
    private mapFieldType;
}
