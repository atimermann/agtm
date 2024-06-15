declare namespace _default {
    /**
     * Initializes the server
     *
     * @param application  {Application}    Instance of application
     */
    function run(application: import("./application.mjs").default): Promise<void>;
    /**
     * Configures the Express server
     *
     * Note: We do not use express view engine, but an external one implemented in the controller
     *
     * @param           httpServer   {object}  HTTP object (Nodejs)
     * @param           application  {Application}  Information about the application being loaded
     *
     * @return {object}              Express object
     * @private
     */
    function _configureExpressHttpServer(httpServer: object, application: import("./application.mjs").default): object;
    /**
     * Loads Applications
     *
     * @param app          {Object}    Expressjs object
     * @param application  {Application}    Information about the Application
     *
     * @private
     */
    function _loadApplications(app: Object, application: import("./application.mjs").default): Promise<void>;
    /**
     * Initializes HTTP server
     *
     * @param httpServer
     */
    function _startHttpServer(httpServer: any): void;
}
export default _default;
/**
 * **Created on 13/11/18**
 *
 * src/library/kernel.js
 */
export type Application = import('./application.mjs').default;
/**
 * **Created on 13/11/18**
 *
 * src/library/kernel.js
 */
export type BaseController = import('./controller/base-controller.mjs').default[];
//# sourceMappingURL=http-server.d.mts.map