/**
 * **Created on 16/11/18**
 *
 * @file library/controller/controller.mjs
 * Abstract class representing the MVC Controller, which is the entry point of our application, from service execution, route configuration, middleware (for plugin implementation), among others.
 * @see https://stackoverflow.com/questions/29480569/does-ecmascript-6-have-a-convention-for-abstract-classes - Defining abstract class.
 * @todo Document creating a flowchart diagram similar to Vuejs.
 * @todo Check proxy to make some attributes readonly.
 * @author André Timermann <andre@timermann.com.br>
 *
 * @file
 *   Classe Abstrata que representa Controlador do MVC, aqui fica o ponto de entrada da nossa aplicação, desde execução de serviços, configuração de
 *   rotas, middleware (Para implementação de plugins) entre outros
 *
 * REF: Definindo classe abstrata - https://stackoverflow.com/questions/29480569/does-ecmascript-6-have-a-convention-for-abstract-classes *
 */
/**
 * Represents a base controller class in the MVC architecture. It's an abstract class and should not be instantiated directly.
 */
export default class BaseController {
    /**
     * The name of the application this controller belongs to.
     * Defined in the controllerController, do not modify.
     *
     * @type {string}
     */
    applicationName: string;
    /**
     * The physical path of this Application.
     * Defined in the controllerController, do not modify.
     *
     * @type {string}
     */
    applicationPath: string;
    /**
     * The name of the app this controller belongs to.
     * Defined in the controllerController, do not modify.
     *
     * @type {string}
     */
    appName: string;
    /**
     * The name of this controller.
     * Defined in the controllerController, do not modify.
     *
     * @type {string}
     */
    controllerName: string;
    /**
     * Unique identifier of the application.
     * Defined in the controllerController, do not modify.
     *
     * @type {string}
     */
    applicationId: string;
    /**
     * Object with the attribute of the applications.
     * Defined in the http-server, do not modify.
     *
     * @type {{}}
     */
    applications: {};
    /**
     * Express object.
     * Defined in the http-server, do not modify.
     *
     * @type {{}}
     */
    app: {};
    /**
     * Physical path of this App.
     * Defined in the controllerController, do not modify.
     *
     * @type {string}
     */
    appPath: string;
    /**
     * Physical path of the application where this app is located.
     * Defined in the controllerController, do not modify.
     * TODO: Definir tipo correto entender como funciona arvore applicationPath Tree
     *
     * @type {object}
     */
    applicationsPath: object;
    /**
     * Tipo de controller, exemplo, http, jobs, socket
     * Defined in the controllerController, do not modify.
     *
     * @type {string}
     */
    controllerType: string;
    /**
     * Gets a complete identification string for the controller, including the application, app, and controller names.
     *
     * @return {string} A string that identifies the controller.
     */
    get completeIndentification(): string;
}
//# sourceMappingURL=base-controller.d.mts.map