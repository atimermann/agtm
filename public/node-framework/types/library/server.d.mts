declare namespace _default {
    /**
     * Initializes the server.
     * Calls the applicationLoader function to get an Application instance and then initializes various server components based on the configuration.
     *
     * @param {function(typeof Application): Application} applicationLoader  - A function that receives the Application class and returns an instance of it.
     *
     * @throws {TypeError} If the provided applicationLoader does not return an instance of Application.
     * @throws {Error} If the jobManager is disabled when running in 'job' mode.
     */
    function init(applicationLoader: (arg0: typeof Application) => Application): Promise<void>;
    /**
     * Initializes the HTTP, Job, and Socket servers based on the application's configuration.
     * It also initiates resource monitoring and displays application information.
     *
     * @param {Application} application  - The instance of the application to initialize servers for.
     */
    function initServer(application: Application): Promise<void>;
    /**
     * Logs the startup information of the application including Node, system details, and application version.
     *
     * @param {Application} application  - The instance of the application to log information for.
     */
    function logInfo(application: Application): void;
}
export default _default;
import Application from './application.mjs';
//# sourceMappingURL=server.d.mts.map