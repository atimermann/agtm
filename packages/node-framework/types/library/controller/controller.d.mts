export default Controller;
declare const Controller_base: any;
/**
 * @mixes JobsMixin
 * @mixes SocketMixin
 * @mixes HttpMixin
 * @mixes HttpViewMixin
 * Represents a base controller class in the MVC architecture. It's an abstract class and should not be instantiated directly.
 */
declare class Controller extends Controller_base {
    [x: string]: any;
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
     *
     * @type {string}
     */
    applicationsPath: string;
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
    /**
     * Abstract setup method, used for initial execution. Should be implemented by subclasses.
     */
    setup(): Promise<void>;
}
//# sourceMappingURL=controller.d.mts.map