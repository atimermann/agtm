/**
 *
 */
export default class Application {
    /**
     * Returns list of applications to be used in importable apps.
     *
     * @return {Libraries} Object containing references to various library classes.
     */
    static getLibraries(): Libraries;
    /**
     * The constructor of the Application class.
     *
     * @param {string} applicationPath  - The physical path of the application. This should be defined using __dirname.
     * @param {string} name             - The name of the application that will be loaded. This is mandatory.
     * @throws {Error} Will throw an error if the path or name parameters are not provided or not of type 'string'.
     */
    constructor(applicationPath: string, name: string);
    /**
     * Stores a list of loaded applications , include self
     *
     * @type {Array<Application>}
     */
    applications: Array<Application>;
    /**
     * Lista de instancia de controllers
     *
     * @type {Array<BaseController>}
     */
    controllers: Array<BaseController>;
    /**
     * A unique identifier for the application
     */
    uuid: string;
    /**
     * indicates that application has already been initialized
     *
     * @type {boolean}
     */
    initialized: boolean;
    /**
     * The name of the Application
     *
     * @type {string}
     */
    name: string;
    /**
     * The path of this Application
     *
     * @type {string}
     */
    path: string;
    /**
     * The path of apps in this application
     */
    appsPath: string;
    /**
     * Loads a sub-application (a dependency of the main application).
     *
     * @param {(ApplicationClass: typeof Application) => Application} applicationLoader  - A function that receives the Application class and returns an instance of it.
     * @throws {TypeError} Will throw an error if the provided applicationLoader is not a valid function.
     */
    loadApplication(applicationLoader: (ApplicationClass: typeof Application) => Application): void;
    /**
     * Initializes application, no longer allows loading subapplication.
     *
     * @param {string[]} [controllersType]  List of controller types to load
     */
    init(controllersType?: string[]): Promise<void>;
    /**
     * @overload
     * @param  {'jobs'}                type  - Controller type specified as 'jobs'.
     * @return {Array<JobsController>}       The loaded controllers of type 'jobs'.
     */
    getControllers(type: 'jobs'): Array<JobsController>;
    /**
     * @overload
     * @param  {'socket'}                type  - Controller type specified as 'socket'.
     * @return {Array<SocketController>}       The loaded controllers of type 'socket'.
     */
    getControllers(type: 'socket'): Array<SocketController>;
    /**
     * @overload
     * @param  {'core'}                type  - Controller type specified as 'core'.
     * @return {Array<CoreController>}       The loaded controllers of type 'core'.
     */
    getControllers(type: 'core'): Array<CoreController>;
    /**
     * @overload
     * @param  {'http'}                type  - Controller type specified as 'http'.
     * @return {Array<HttpController>}       The loaded controllers of type 'http'.
     */
    getControllers(type: 'http'): Array<HttpController>;
    /**
     * Returns information about all apps from all loaded applications.
     *
     * @return {Promise<Array<AppInfo>>} Promise resolved with an array of app information.
     */
    getApps(): Promise<Array<AppInfo>>;
}
/**
 * Created at 20/09/2018
 *
 * src/library/application.js
 */
export type BaseController = import('./controller/base-controller.mjs').default;
/**
 * - The controller for handling job-related actions.
 */
export type JobsController = import('./controller/jobs.mjs').default;
/**
 * - The controller for handling socket-related actions.
 */
export type SocketController = import('./controller/socket.mjs').default;
/**
 * - The main controller handling core framework functionalities.
 */
export type CoreController = import('./controller/core.mjs').default;
/**
 * - The controller for handling HTTP-related actions.
 */
export type HttpController = import('./controller/http.mjs').default;
/**
 * Created at 20/09/2018
 *
 * src/library/application.js
 */
export type Libraries = {
    /**
     * - Function to create a logger instance.
     */
    createLogger: Function;
    /**
     * - The JobManager class.
     */
    JobManager: typeof JobManager;
    /**
     * - The WorkerManager class.
     */
    WorkerManager: typeof WorkerManager;
    /**
     * - The Config class.
     */
    Config: typeof Config;
};
/**
 * Created at 20/09/2018
 *
 * src/library/application.js
 */
export type AppInfo = {
    /**
     * - Caminho para o app.
     */
    path: string;
    /**
     * - Nome da aplicação à qual o app pertence.
     */
    applicationName: string;
    /**
     * - Nome do app.
     */
    appName: string;
};
import JobManager from './jobs/job-manager.mjs';
import WorkerManager from './jobs/worker-manager.mjs';
import Config from './config.mjs';
//# sourceMappingURL=application.d.mts.map