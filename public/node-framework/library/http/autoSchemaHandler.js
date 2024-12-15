import { sentenceCase } from "change-case";
export class AutoSchemaHandler {
    schema;
    static async createFromFile(fileDescription) {
        const autoSchema = await this.loadSchema(fileDescription);
        return new AutoSchemaHandler(autoSchema);
    }
    static async loadSchema(fileDescription) {
        const schema = {
            fields: [],
            ...(await import(fileDescription.path, { with: { type: "json" } })).default,
        };
        schema.fields = schema.fields.map((schemaElement) => ({
            create: true,
            update: true,
            view: true,
            properties: {},
            ...schemaElement,
        }));
        return schema;
    }
    constructor(schema) {
        this.schema = schema;
    }
    /**
     * Get the list of fields from the schema.
     */
    getCreateFieldsName() {
        return this.schema.fields.filter((field) => field.create === true).map((field) => field.name);
    }
    /**
     * Returns list of fields configured to return to user
     */
    generateSelectField() {
        const prismaSelectFields = {};
        // Chave
        prismaSelectFields[this.schema.key] = true;
        for (const field of this.schema.fields) {
            if (field.view === false)
                continue;
            prismaSelectFields[field.dbName || field.name] = true;
        }
        return prismaSelectFields;
    }
    /**
     * Retorna lista de campos configurado para ser exibido na view
     *
     * @param key Força retorno do valor da chave primária
     */
    getViewFields(key = true) {
        const viewFields = this.schema.fields
            .filter((field) => field.view !== false)
            .map((field) => field.dbName || field.name);
        if (key)
            viewFields.push(this.schema.key);
        return viewFields;
    }
    /**
     * Mapeia o formato padrão Auto SChema para o formato de schema utilizado pelo Crud do Frontend
     * TODO: Conerter o método em um mapper
     */
    mapAutoSchemaToCrudSchema() {
        const crudSchema = {
            ...this.schema.ui,
            fields: [],
        };
        //////////////////////////////////////////////////
        // Adiciona Chave
        //////////////////////////////////////////////////
        crudSchema.fields.push({
            label: this.schema.key,
            name: this.schema.key,
            ignoreForm: true,
        });
        //////////////////////////////////////////////////
        // MAP FIELDS
        //////////////////////////////////////////////////
        for (const field of this.schema.fields) {
            if (!field.create && !field.update && !field.view)
                continue;
            const crudField = {
                name: field.name,
                label: field.properties.label || sentenceCase(field.name),
                ignoreGrid: !field.view,
                ignoreForm: !field.create && !field.update,
            };
            crudSchema.fields.push({
                ...crudField,
                ...field.properties,
            });
        }
        return crudSchema;
    }
}
