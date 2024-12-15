import { resolve } from "node:path";
import { existsSync } from "fs";
import { HttpRouter } from "./httpRouter.js";
import { ApiController } from "./apiController.js";
import { AutoSchemaHandler } from "./autoSchemaHandler.js";
import { AutoToHttpSchemaMapper } from "./mapper/autoToHttpSchemaMapper.js";
export default class ApiGenerator {
    logger;
    server;
    constructor(logger, server) {
        this.logger = logger;
        this.server = server;
    }
    /**
     * Gera uma nova API completa automaticamente baseado no schema
     *
     * @param fileDescription
     */
    async generate(fileDescription) {
        this.logger.debug(`Generating API for: "${fileDescription.id}"`);
        ////////////////////////////////////////////////////////////////////////////
        // 01. CREATE SCHEMA HANDLER
        ////////////////////////////////////////////////////////////////////////////
        const autoSchema = await AutoSchemaHandler.createFromFile(fileDescription);
        ////////////////////////////////////////////////////////////////////////////
        // 02. CREATE CONTROLLER
        ////////////////////////////////////////////////////////////////////////////
        const controllerPath = fileDescription.path.replace(/\.auto\.json$/, ".controller.js");
        const controllerInstance = await this.loadAndInitializeApiController(controllerPath, autoSchema);
        if (controllerInstance.__INSTANCE__ !== "__HttpController") {
            throw new TypeError(`The controller "${controllerPath}" it is not "HttpController" instance!`);
        }
        await controllerInstance.setup();
        ////////////////////////////////////////////////////////////////////////////
        // 03. CREATE SCHEMA HANDLER
        ////////////////////////////////////////////////////////////////////////////
        // const httpSchemaPath = fileDescription.path.replace(/\.auto\.json$/, ".schema.js")
        //
        // this.logger.debug(`Loading http server schema(Fastify): "${controllerPath}"...`)
        // const httpSchemarExist = existsSync(httpSchemaPath)
        //
        // const httpSchema = httpSchemarExist
        //   ? await this.loadAndInitializeSchema(httpSchemaPath)
        //   :
        const httpSchema = new AutoToHttpSchemaMapper(autoSchema);
        ////////////////////////////////////////////////////////////////////////////
        // 04. CREATE ROUTE
        ////////////////////////////////////////////////////////////////////////////
        const routerPath = fileDescription.path.replace(/\.auto\.json$/, ".router.js");
        this.logger.debug(`Loading router: "${routerPath}"...`);
        const routingExist = existsSync(routerPath);
        if (!routingExist) {
            this.logger.debug(`Router not defined! Generating auto route for "${fileDescription.id}"...`);
        }
        const routerInstance = await this.loadAndInitializeRouter(routerPath, controllerInstance, httpSchema.mapSchema());
        ////////////////////////////////////////////////////////////////////////////
        // 05. CONFIGURE ROUTE
        ////////////////////////////////////////////////////////////////////////////
        // Create auto route
        const routeName = autoSchema.schema.route;
        // const capitalizeRoute: string = capitalize(routeName)
        // const pluralizeRoute = pluralize(capitalizeRoute)
        routerInstance.post(`/${routeName}`, "create");
        routerInstance.get(`/${routeName}`, "getAll");
        routerInstance.get(`/${routeName}/:id(\\d+)`, "get");
        routerInstance.put(`/${routeName}/:id(\\d+)`, "update");
        routerInstance.delete(`/${routeName}/:id(\\d+)`, "delete");
        routerInstance.get(`/${routeName}/schema`, "schema");
        await routerInstance.setup();
        ////////////////////////////////////////////////////////////////////////////
        // FIM
        ////////////////////////////////////////////////////////////////////////////
    }
    /**
     * Importa e instancia a classe do router existente.
     * TODO: Tratar tipo correto do httpSchema
     * @param routerPath
     * @param controllerInstance
     * @param httpSchema
     */
    async loadAndInitializeRouter(routerPath, controllerInstance, httpSchema) {
        try {
            this.logger.debug(`Loading controller: "${routerPath}"...`);
            const RouterClass = existsSync(routerPath)
                ? (await import(resolve(routerPath))).default
                : HttpRouter;
            return new RouterClass(this.server, this.logger, controllerInstance, httpSchema);
        }
        catch (error) {
            this.logger.error(`Failed to load router: "${routerPath}".`);
            throw error;
        }
    }
    /**
     * Importa e iniciancia novos controllers (Gerado automaticamente ou userspace)
     *
     * @param controllerPath
     * @param autoSchema
     */
    async loadAndInitializeApiController(controllerPath, autoSchema) {
        try {
            this.logger.debug(`Loading controller: "${controllerPath}"...`);
            const ControllerClass = existsSync(controllerPath)
                ? (await import(resolve(controllerPath))).default
                : ApiController;
            return new ControllerClass(autoSchema, this.logger);
        }
        catch (error) {
            this.logger.error(`Failed to load router: "${controllerPath}".`);
            throw error;
        }
    }
}
