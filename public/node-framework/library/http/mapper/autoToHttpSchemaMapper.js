export class AutoToHttpSchemaMapper {
    autoSchema;
    constructor(schema) {
        this.autoSchema = schema;
    }
    /**
     * Gera todos os schemas de validação e serialização utilizado pelo Fastify a partir do AutoSchema
     *
     * REF: https://fastify.dev/docs/latest/Reference/Validation-and-Serialization/#validation
     */
    mapSchema() {
        return {
            dynamicCreate: {
                body: this.mapBody("create"),
                query: undefined,
                params: undefined,
                header: undefined,
            },
            dynamicGetAll: undefined,
            dynamicGet: {
                body: undefined,
                query: undefined,
                params: this.mapParam(),
                header: undefined,
            },
            dynamicUpdate: {
                body: this.mapBody("update"),
                query: undefined,
                params: this.mapParam(),
                header: undefined,
            },
            dynamicDelete: {
                body: undefined,
                query: undefined,
                params: this.mapParam(),
                header: undefined,
            },
            dynamicSchema: undefined,
        };
    }
    /**
     * Converte o schema de fields para o formato JSON Schema do Fastify
     */
    mapBody(route) {
        const jsonSchema = {
            type: "object",
            required: [],
            properties: {},
        };
        for (const field of this.autoSchema.schema.fields) {
            if (route === "create" && field.create === false)
                continue;
            if (route === "update" && field.update === false)
                continue;
            jsonSchema.properties[field.name] = {
                type: this.mapFieldType(field.type),
            };
            // Campo Obrigatório
            if (field.required) {
                jsonSchema.required.push(field.name);
            }
        }
        return jsonSchema;
    }
    /**
     * Define os parametros usados para filtrar dados, o padrão é ID
     * @private
     */
    mapParam() {
        return {
            type: "object",
            properties: {
                id: { type: "integer" },
            },
        };
    }
    /**
     * Mapeia os tipos do AutoSchema para os tipos suportados pelo JSON Schema do Fastify
     * REF: https://json-schema.org/understanding-json-schema/reference/type
     */
    mapFieldType(type) {
        switch (type) {
            case "string":
                return "string";
            case "integer":
                return "integer";
            case "number":
                return "number";
            case "boolean":
                return "boolean";
            case "array":
                return "array";
            default:
                return "string";
        }
    }
}
