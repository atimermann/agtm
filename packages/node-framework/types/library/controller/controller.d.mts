export default Controller;
/**
 * @mixes JobsMixin
 */
declare class Controller {
    /**
     * Nome da aplicação que este controller pertence
     * Definido em controllerController, não alterar
     *
     * @type {string}
     */
    applicationName: string;
    /**
     * Nome da app que este controller pertence
     * Definido em controllerController, não alterar
     *
     * @type {string}
     */
    appName: string;
    /**
     * None desde controller
     * Definido em controllerController, não alterar
     *
     * @type {string}
     */
    controllerName: string;
    /**
     * Identificador unico da aplicação
     * Definido em controllerController, não alterar
     *
     * @type {string}
     */
    applicationId: string;
    /**
     * Objeto com atributo das aplicações
     * Definido em http-server, não alterar
     *
     * @type {{}}
     */
    applications: {};
    /**
     * Objeto Express
     * Definido em http-server, não alterar
     *
     * @type {{}}
     */
    app: {};
    /**
     * Caminho físico desta App
     * Definido em controllerController, não alterar
     *
     * @type {string}
     */
    appPath: string;
    /**
     * Caminho físico da aplicação onde esta app está
     * Definido em controllerController, não alterar
     *
     * @type {string}
     */
    applicationsPath: string;
    /**
     *
     */
    get completeIndentification(): string;
    /**
     * Abstract Setup method, used for initial execution
     */
    setup(): Promise<void>;
}
//# sourceMappingURL=controller.d.mts.map