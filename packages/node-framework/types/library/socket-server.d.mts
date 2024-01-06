/**
 * Class representing a Socket Server
 *
 * @class
 */
export default class SocketServer {
    /**
     * The mode of the socket server. Determines the type of server to create (e.g., standalone, standalone-http, etc.).
     * Loaded from the configuration file.
     *
     * @type {string}
     * @static
     */
    static mode: string;
    /**
     * The port number on which the socket server will run. Loaded from the configuration file.
     *
     * @type {number}
     * @static
     */
    static port: number;
    /**
     * The SSL key pair for the server, used when creating an HTTPS or HTTP2 server. Loaded from the configuration file.
     * Contains paths to the key and certificate files.
     *
     * @type {object}
     * @static
     */
    static keys: object;
    /**
     * Holds the instance of the Socket.io server.
     *
     * @type {import("socket.io").Server}
     */
    static io: any;
    /**
     * Runs the Socket Server based on the configuration mode
     *
     * @param  application
     * @static
     * @throws {Error} When an invalid socket mode is provided
     */
    static run(application: any): void;
    /**
     * Loads the configuration for the Socket Server from the Config module.
     * This method should be called before creating the server.
     * The configuration includes the server mode, port, and SSL key pair.
     *
     * @private
     * @static
     */
    private static _loadConfiguration;
    /**
     * Loads Applications
     *
     * @param application  {Application}    Information about the Application
     *
     * @private
     */
    private static _loadApplications;
    /**
     * Configures an existing Express HTTP Server for use with socket.io
     *
     * @static
     * @param {object} httpServer  - The HTTP server instance to configure.
     */
    static configureExpressHttpServer(httpServer: object): void;
    /**
     * Creates a standalone Socket Server
     *
     * @private
     * @static
     * @return {Server} - The newly created Socket Server
     */
    private static _createStandaloneServer;
    /**
     * Creates a standalone HTTP Socket Server
     *
     * @private
     * @static
     * @return {Server} - The newly created Socket Server
     */
    private static _createStandaloneHttpServer;
    /**
     * Creates a standalone HTTPS Socket Server
     *
     * @private
     * @static
     * @return {Server} - The newly created Socket Server
     */
    private static _createStandaloneHttpsServer;
    /**
     * Creates a standalone HTTP2 Socket Server
     *
     * @private
     * @static
     * @return {Server} - The newly created Socket Server
     */
    private static _createStandaloneHttp2Server;
    /**
     * Gets HTTPS options for creating a secure server
     *
     * @private
     * @static
     * @return {object} - An object containing the key and cert for HTTPS
     */
    private static _getHttpsOptions;
    /**
     * Genreate Socket config options
     *
     * @return {object}
     * @private
     */
    private static _getOptions;
}
//# sourceMappingURL=socket-server.d.mts.map