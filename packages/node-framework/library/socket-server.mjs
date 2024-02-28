/**
 * Created on 27/07/23
 *
 * @file
 * This module provides functionality to initialize and run a Socket.io server
 * with various modes of operation including standalone and integrated with HTTP/HTTPS servers.
 * It supports SSL/TLS for secure connections and allows configuration of CORS and transport options.
 *
 *
 * @author André Timermann <andre@timermann.com.br>
 * TODO: Abstrair middlewares? ?? https://socket.io/docs/v4/middlewares/
 *  https://www.youtube.com/watch?v=0RMYomgf4a8
 *
 *
 * Todas as opções disponivel para serem analisada e implentada: https://socket.io/docs/v4/server-options/
 * @typedef {import('./application.mjs').default} Application
 * @typedef {import('./controller/socket.mjs').default} SocketController - The controller for handling socket-related actions.
 *
 * @typedef {object} SocketConfigOptions
 * Represents the configuration options for a socket connection. This object includes
 * all necessary settings required to establish and manage a socket connection within
 * the application. The settings are derived and processed from the application's configuration.
 *
 * @property {boolean}                                                                                    [enabled]     - Indicates if the socket server is enabled.
 * @property {number}                                                                                     [port]        - The port number on which the socket server should listen.
 * @property {'standalone' | 'http-server' | 'standalone-http' | 'standalone-https' | 'standalone-http2'} [mode]        - The mode of execution for the socket server.
 * @property {object}                                                                                     [keys]        - SSL/TLS keys for https and http2 modes.
 * @property {string}                                                                                     keys.cert     - The path to the SSL/TLS certificate.
 * @property {string}                                                                                     keys.key      - The path to the SSL/TLS key.
 * @property {object}                                                                                     [cors]        - CORS configuration settings.
 * @property {string}                                                                                     cors.origin   - Allowed origin(s) for the socket server.
 * @property {Array<string>}                                                                              [transports]  - Allowed transport methods for the socket server.
 */

/**
 * @typedef {object} SSLKeyPair
 * Represents the SSL/TLS key pair configuration for HTTPS or HTTP2 servers.
 * @property {string} cert  - The file path to the SSL/TLS certificate.
 * @property {string} key   - The file path to the SSL/TLS key.
 */

import { createServer } from 'node:http'
import { readFileSync } from 'node:fs'
import { createServer as createHttpsServer } from 'node:https'
import { createSecureServer } from 'node:http2'
import { Server } from 'socket.io'
import Config from './config.mjs'
import chalk from 'chalk'

import createLogger from './logger.mjs'
const logger = createLogger('Socket')

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
  static mode

  /**
   * The port number on which the socket server will run. Loaded from the configuration file.
   *
   * @type {number}
   * @static
   */
  static port

  /**
   * The SSL key pair for the server, used when creating an HTTPS or HTTP2 server. Loaded from the configuration file.
   * Contains paths to the key and certificate files.
   *
   * @type {SSLKeyPair}
   * @static
   */
  static sslPairKeys

  /**
   * Holds the instance of the Socket.io server.
   *
   * @type {import("socket.io").Server}
   */
  static io

  /**
   * Runs the Socket Server based on the configuration mode.
   *
   * @param {Application} application  Application instance
   * @static
   * @throws {Error} When an invalid socket mode is provided
   */
  static async run (application) {
    logger.info('Initializing Socket Server...')

    this.#loadConfiguration()

    logger.info('==============================================================')
    logger.info(`Mode:      ${this.mode}`)
    logger.info(`Port:      ${this.mode === 'http-server' ? Config.get('httpServer.port') : this.port}`)
    logger.info(`Cors:      ${JSON.stringify((this.#getOptions()).cors)}`)
    logger.info(`Transport: ${this.#getOptions().transports}`)
    if (this.mode === 'standalone-https' || this.mode === 'standalone-http2') {
      logger.info('SSL:       true')
      logger.info(`  Certificate:   ${this.sslPairKeys.cert}`)
      logger.info(`  Key:           ${this.sslPairKeys.key}`)
    } else {
      logger.info('SSL: false')
    }
    logger.debug('Options:')
    logger.debug(this.#getOptions())
    logger.info('==============================================================')

    // NOTE: In http-server mode, the server setup is initiated in the http-server module and called in
    //   configureExpressHttpServer
    switch (this.mode) {
      case 'http-server':
        if (!this.io) throw new Error('In this mode Http server must be initialized before starting Socket Server.')
        break
      case 'standalone':
        this.io = this.#createStandaloneServer()
        break
      case 'standalone-http':
        this.io = this.#createStandaloneHttpServer()
        break
      case 'standalone-https':
        this.io = this.#createStandaloneHttpsServer()
        break
      case 'standalone-http2':
        this.io = this.#createStandaloneHttp2Server()
        break
      default:
        throw new Error(`Invalid socket mode: ${this.mode}`)
    }

    this.io.on('connection', socket => {
      logger.info(`${chalk.bold('New connection:')} ID: "${socket.id}" Path: "${socket.nsp.name}"`)

      socket.on('disconnect', (reason) => {
        logger.info(`${chalk.bold('Disconnection: ID:')} "${socket.id}" Path: "${socket.nsp.name}" Reason: "${reason}"`)
      })
    })

    await this.#loadApplications(application)

    logger.info('Socket Server started.')
  }

  /**
   * Loads the configuration for the Socket Server from the Config module.
   * This method should be called before creating the server.
   * The configuration includes the server mode, port, and SSL key pair.
   *
   * @static
   */
  static #loadConfiguration () {
    this.mode = Config.get('socket.mode')
    this.port = Config.get('socket.port')
    this.sslPairKeys = Config.get('socket.keys')
  }

  /**
   * Loads Applications.
   *
   * @param {Application} application  Information about the Application
   */
  static async #loadApplications (application) {
    for (const controller of application.getControllers('socket')) {
      logger.debug(`Loading application: "${controller.controllerName}"`)

      controller.io = this.io

      // Load namespace in nsp

      controller.nsp = this.io.of(controller.namespace)

      await this.#runSetup(controller)

      // Get Connection
      controller.nsp.on('connection', async socket => {
        await controller.newConnection(socket)
      })
    }
  }

  /**
   * Sets up the controller for handling socket connections.
   *
   * @param {SocketController} controller  - The controller to set up.
   */
  static async #runSetup (controller) {
    await controller.setup()
    logger.info('Socket applications loaded!')
    logger.debug(`Controller loaded: "${controller.applicationName}/${controller.appName}/${controller.controllerName}"`)
  }

  /**
   * Configures an existing Express HTTP Server for use with socket.io.
   *
   * @static
   * @param {import('http').Server} httpServer  - The HTTP server instance to configure.
   */
  static configureExpressHttpServer (httpServer) {
    if (Config.get('socket.enabled', 'boolean') && Config.get('socket.mode') === 'http-server') {
      this.io = new Server(httpServer, this.#getOptions())
    }
  }

  /**
   * Creates a standalone Socket Server.
   *
   * @static
   * @return {Server} - The newly created Socket Server
   */
  static #createStandaloneServer () {
    return new Server(this.port, this.#getOptions())
  }

  /**
   * Creates a standalone HTTP Socket Server.
   *
   * @static
   * @return {Server} - The newly created Socket Server
   */
  static #createStandaloneHttpServer () {
    const httpServer = createServer()
    const io = new Server(httpServer, this.#getOptions())
    httpServer.listen(this.port)
    return io
  }

  /**
   * Creates a standalone HTTPS Socket Server.
   *
   * @static
   * @return {Server} - The newly created Socket Server
   */
  static #createStandaloneHttpsServer () {
    const httpsServer = createHttpsServer(this.#getHttpsOptions())
    const io = new Server(httpsServer, this.#getOptions())
    httpsServer.listen(this.port)
    return io
  }

  /**
   * Creates a standalone HTTP2 Socket Server.
   *
   * @static
   * @return {Server} - The newly created Socket Server
   */
  static #createStandaloneHttp2Server () {
    const httpsServer = createSecureServer({ allowHTTP1: true, ...this.#getHttpsOptions() })
    const io = new Server(httpsServer, this.#getOptions())
    httpsServer.listen(this.port)
    return io
  }

  /**
   * Gets HTTPS options for creating a secure server.
   *
   * @static
   * @return {object} - An object containing the key and cert for HTTPS
   */
  static #getHttpsOptions () {
    if (!this.sslPairKeys.key || !this.sslPairKeys.key) {
      throw new Error('SSL certificate key or certificate not provided. Please specify in env vars NF_SOCKET_KEYS_KEY and NF_SOCKET_KEYS_CERT with certificate and key path')
    }

    try {
      return {
        key: readFileSync(this.sslPairKeys.key),
        cert: readFileSync(this.sslPairKeys.cert)
      }
    } catch (error) {
      throw new Error(`Failed to read SSL key or certificate file: ${error.message}`)
    }
  }

  /**
   * Generate Socket config options.
   *
   * @return {Partial<import("socket.io").ServerOptions>} Returns processed settings
   */
  static #getOptions () {
    // TODO: Deve retornar node_modules/socket.io/dist/index.d.ts: ServerOptions  VALIDAR
    //  Separar otions usado pelo new Server do usado pra configurar o SocketServer
    return {
      ...Config.get('socket.options'),
      cors: Config.get('socket.cors'),
      transports: Config.get('socket.transports')
    }
  }
}
