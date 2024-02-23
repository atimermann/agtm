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
     * @type {SSLKeyPair}
     * @static
     */
    static sslPairKeys: SSLKeyPair;
    /**
     * Holds the instance of the Socket.io server.
     *
     * @type {import("socket.io").Server}
     */
    static io: import("socket.io").Server;
    /**
     * Runs the Socket Server based on the configuration mode.
     *
     * @param {Application} application  Application instance
     * @static
     * @throws {Error} When an invalid socket mode is provided
     */
    static run(application: Application): Promise<void>;
    /**
     * Loads the configuration for the Socket Server from the Config module.
     * This method should be called before creating the server.
     * The configuration includes the server mode, port, and SSL key pair.
     *
     * @static
     */
    static "__#2@#loadConfiguration"(): void;
    /**
     * Loads Applications.
     *
     * @param {Application} application  Information about the Application
     */
    static "__#2@#loadApplications"(application: Application): Promise<void>;
    /**
     * Sets up the controller for handling socket connections.
     *
     * @param {SocketController} controller  - The controller to set up.
     */
    static "__#2@#runSetup"(controller: SocketController): Promise<void>;
    /**
     * Configures an existing Express HTTP Server for use with socket.io.
     *
     * @static
     * @param {import('http').Server} httpServer  - The HTTP server instance to configure.
     */
    static configureExpressHttpServer(httpServer: import('http').Server): void;
    /**
     * Creates a standalone Socket Server.
     *
     * @static
     * @return {Server} - The newly created Socket Server
     */
    static "__#2@#createStandaloneServer"(): Server;
    /**
     * Creates a standalone HTTP Socket Server.
     *
     * @static
     * @return {Server} - The newly created Socket Server
     */
    static "__#2@#createStandaloneHttpServer"(): Server;
    /**
     * Creates a standalone HTTPS Socket Server.
     *
     * @static
     * @return {Server} - The newly created Socket Server
     */
    static "__#2@#createStandaloneHttpsServer"(): Server;
    /**
     * Creates a standalone HTTP2 Socket Server.
     *
     * @static
     * @return {Server} - The newly created Socket Server
     */
    static "__#2@#createStandaloneHttp2Server"(): Server;
    /**
     * Gets HTTPS options for creating a secure server.
     *
     * @static
     * @return {object} - An object containing the key and cert for HTTPS
     */
    static "__#2@#getHttpsOptions"(): object;
    /**
     * Generate Socket config options.
     *
     * @return {Partial<import("socket.io").ServerOptions>} Returns processed settings
     */
    static "__#2@#getOptions"(): Partial<import("socket.io").ServerOptions>;
}
/**
 * Created on 27/07/23
 */
export type Application = import('./application.mjs').default;
/**
 * - The controller for handling socket-related actions.
 */
export type SocketController = import('./controller/socket.mjs').default;
/**
 * Represents the configuration options for a socket connection. This object includes
 * all necessary settings required to establish and manage a socket connection within
 * the application. The settings are derived and processed from the application's configuration.
 */
export type SocketConfigOptions = {
    /**
     * - Indicates if the socket server is enabled.
     */
    enabled?: boolean;
    /**
     * - The port number on which the socket server should listen.
     */
    port?: number;
    /**
     * - The mode of execution for the socket server.
     */
    mode?: 'standalone' | 'http-server' | 'standalone-http' | 'standalone-https' | 'standalone-http2';
    /**
     * - SSL/TLS keys for https and http2 modes.
     */
    keys?: {
        cert: string;
        key: string;
    };
    /**
     * - CORS configuration settings.
     */
    cors?: {
        origin: string;
    };
    /**
     * - Allowed transport methods for the socket server.
     */
    transports?: Array<string>;
};
/**
 * Represents the SSL/TLS key pair configuration for HTTPS or HTTP2 servers.
 */
export type SSLKeyPair = {
    /**
     * - The file path to the SSL/TLS certificate.
     */
    cert: string;
    /**
     * - The file path to the SSL/TLS key.
     */
    key: string;
};
import { Server } from 'socket.io';
//# sourceMappingURL=socket-server.d.mts.map