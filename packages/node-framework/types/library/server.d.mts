declare namespace _default {
    /**
     * Initializes the server.
     *
     * @param  {function(Application): Application} applicationLoader  - A function that receives the Application class and returns an instance of it.
     *
     * @throws {TypeError} If the provided applicationLoader does not return an instance of Application.
     * @throws {Error} If the jobManager is disabled when running in 'job' mode.
     *
     * @return {void}
     */
    function init(applicationLoader: (arg0: Application) => Application): void;
    /**
     * Initializes Server
     *
     * @param {Application} application
     */
    function initServer(application: Application): Promise<void>;
    function logInfo(application: any): void;
}
export default _default;
import Application from './application.mjs';
//# sourceMappingURL=server.d.mts.map