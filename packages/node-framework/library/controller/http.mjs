/**
 * Created on 28/07/23
 *
 * @file library/controller/http.mjs
 * Defines the HttpController class, which extends the functionalities of the BaseController
 * to handle HTTP-specific tasks and routes within the framework.
 *
 * @author André Timermann <andre@timermann.com.br>
 *
 * @typedef {'all'|'use'|'post'|'get'|'put'|'delete'|'patch'} MethodType
 *
 * @typedef {import('express')} Express - Importing the Express module for type definitions.
 * @typedef {import('express').Router} ExpressRouter - Importing the Router type from Express.
 * @typedef {import('express').Request} ExpressRequest - Importing the Request type from Express.
 * @typedef {import('express').Response} ExpressResponse - Importing the Response type from Express.
 * @typedef {import('express')} ExpressPathParams
 *
 * @typedef {(string|RegExp|Array<string|RegExp>)} PathArgument
 *
 * @typedef {import('express').RequestHandler} RequestHandler
 * @typedef {import('express').ErrorRequestHandler} ErrorHandler
 *
 * @typedef {RequestHandler} Handler
 * @typedef {Handler | Handler[]} HandlerArgument
 *
 * @typedef {object} RouteInfo
 * @property {string}    method     - The HTTP method of the route (e.g., 'GET', 'POST').
 * @property {string}    path       - The path of the route.
 * @property {string}    app        - The name of the application where the route is defined.
 *
 * @typedef {object} ErrorInfo
 * @property {boolean}   error      - Indicator of an error occurrence.
 * @property {string}    message    - Descriptive error message.
 *
 * @typedef {object} ErrorResponse
 * @property {ErrorInfo} errorInfo  - Object containing error details.
 * @property {number}    status     - HTTP status code associated with the error.
 */
import path from 'node:path'

import createLogger from '../../library/logger.mjs'
import { performance } from 'node:perf_hooks'
import BaseController from './base-controller.mjs'
import consolidate from 'consolidate'

const logger = createLogger('BaseController')

/**
 * Used to store and manage the defined routes in the application.
 * It acts as a registry for all routes, indexed by a unique hash composed of the HTTP method
 * and the route path. This registry ensures that each route is unique and prevents duplication
 * across the application. The structure typically includes details like the HTTP method,
 * the full path of the route, and the name of the application where the route is defined.
 *
 * @type {{[key: string]: RouteInfo}}
 */
const paths = {}

/**
 * HttpController Class
 */
export default class HttpController extends BaseController {
  /**
   * The Express Router object. Defined in the http-server, it should not be modified directly.
   *
   * @type {ExpressRouter}
   */
  router = undefined

  /**
   * Base path of the application, ex: /api/v1/clients
   * Works as a prefix, not requiring to always put the complete route
   *
   * @type {string}
   */
  path = undefined

  /**
   * URL base padrão  para acesso a recursos estáticos.
   * Será usado pelo Helper @asset, que calcula automaticamente a url do recurso que será carregado na página
   *
   * Definido em http-server
   *
   * @type {string}
   */
  staticBaseUrl = undefined

  // -------------------------------------------------------------------------------------------------------------------
  // Helper Methods for Route and REST API Creation
  // Other methods can be accessed using this.app (object that refers to express instance used in the application)
  // -------------------------------------------------------------------------------------------------------------------
  /**
   * All Route.
   *
   * @param {string} path      - The path for the POST request.
   * @param {...any} handlers  - A series of numbers (handlers).
   */
  all (path, ...handlers) {
    this.#processRestMethod('all', ...[path, ...handlers])
  }

  /**
   * Defines a route for HTTP POST requests.
   *
   * @param {HandlerArgument[]} handlers  - A series of numbers (handlers).
   */
  use (...handlers) {
    this.#processRestMethod('use', ...handlers)
  }

  /**
   * Defines a route for HTTP POST requests.
   *
   * @param {string}            path      - The path for the POST request.
   * @param {HandlerArgument[]} handlers  - A series of numbers (handlers).
   */
  post (path, ...handlers) {
    this.#processRestMethod('post', ...[path, ...handlers])
  }

  /**
   * Defines a route for HTTP GET requests.
   *
   * @param {string}            path      - The path for the POST request.
   * @param {HandlerArgument[]} handlers  - A series of numbers (handlers).
   */
  get (path, ...handlers) {
    this.#processRestMethod('get', ...[path, ...handlers])
  }

  /**
   * Defines a route for HTTP PUT requests.
   *
   * @param {string}            path      - The path for the POST request.
   * @param {HandlerArgument[]} handlers  - A series of numbers (handlers).
   */
  put (path, ...handlers) {
    this.#processRestMethod('put', ...[path, ...handlers])
  }

  /**
   * Defines a route for HTTP DELETE requests.
   *
   * @param {string}            path      - The path for the POST request.
   * @param {HandlerArgument[]} handlers  - A series of numbers (handlers).
   */
  delete (path, ...handlers) {
    this.#processRestMethod('delete', ...[path, ...handlers])
  }

  /**
   * Defines a route for HTTP PATCH requests.
   *
   * @param {string}            path      - The path for the POST request.
   * @param {HandlerArgument[]} handlers  - A series of numbers (handlers).
   */
  patch (path, ...handlers) {
    this.#processRestMethod('patch', ...[path, ...handlers])
  }

  /**
   * Asynchronously handles the responses of the Express.js framework. Executes the provided callback
   * function that defines the API, handles potential errors, and sends appropriate HTTP responses.
   *
   * @async
   * @param  {Function}        lastCallback  - The callback function handling the HTTP request and generating a response.
   *                                         It's expected to be asynchronous and take in Express's request and
   *                                         response objects, along with any additional arguments.
   * @param  {ExpressRequest}  request       - The Express.js Request object containing details about the incoming HTTP request.
   * @param  {ExpressResponse} response      - The Express.js Response object used to send an HTTP response to the client.
   * @param  {...any}          args          - Additional arguments that the `lastCallback` function may require.
   * @return {Promise<void>}                 - Resolves when the response has been sent. If an error occurs in the callback,
   *                                         it rejects with the error and sends an error response to the client.
   */
  async responseHandler (lastCallback, request, response, ...args) {
    try {
      await lastCallback(request, response, ...args)
    } catch (err) {
      const { status, errorInfo } = await this.errorHandler(err)
      response.status(status).json(errorInfo)
      console.error(err)
      logger.error(JSON.stringify({ message: err.message, stack: err.stack }))
    }
  }

  /**
   * Standardized error handling of the API. It can be extended by the user to standardize or select errors that
   * will be displayed.
   *
   * @param  {Error}                  err  - The error object to be handled.
   *
   * @return {Promise<ErrorResponse>}      An object containing error information and the HTTP status code.
   */
  async errorHandler (err) {
    return {
      status: 400,
      errorInfo: {
        error: true,
        message: err.message
      }
    }
  }

  /**
   * TODO: migrar para ser executado em route  this.pre(<function>)
   *
   * Abstract method for Pre Middleware creation.
   */
  async pre () {
    logger.debug(`Pre Middleware not implemented in ${this.completeIndentification}.`)
  }

  /**
   * TODO: migrar para ser executado em route  this.pos(<function>)
   * Abstract method for Post Middleware creation.
   */
  async pos () {
    logger.debug(`Post Middleware not implemented in ${this.completeIndentification}.`)
  }

  /**
   * Abstract Router method, used to configure Routes.
   */
  async setup () {
    logger.debug(`No route configured in ${this.completeIndentification}.`)
  }

  /**
   * TODO: Refactoring
   *
   * A private method designed to process HTTP methods (GET, POST, etc.) used by the user.
   * It works by intercepting these methods and injecting a middleware-like functionality
   * that allows performance measurement and request logging.
   *
   * This method enables the user to use HTTP methods such as 'all', 'use', 'post', 'get',
   * 'put', 'delete', 'patch' and internally translates them into a route creation call
   * using Express's router.
   *
   * @param  {MethodType} httpMethod  - The HTTP method to be processed.
   * @param  {any[]}      args        - Rest of arguments
   *
   * @return {void}                   - This method does not return a value.
   *
   * @throws {TypeError} Throws an error if the first argument of the method (routePath)
   *                     is not a string, meaning it's a pathless method like 'use'.
   */
  #processRestMethod (httpMethod, ...args) {
    // Gets last callback and modifies to handle returns
    const lastCallback = args.pop()

    if (typeof lastCallback === 'function') {
      // replaces last callback with a function that processes the last callback (responseHandler)
      args.push(async (...args) => {
        const startTimeMeasure = performance.now()
        await this.responseHandler(lastCallback, ...args)
        this.#logRequestInfo(startTimeMeasure, args)
      })
    } else {
      args.push(lastCallback)
    }

    const routePath = args[0]

    // Validates if the path has already been used in another controller, if args[0] is not a string it is a pathless
    // method like use
    if (typeof routePath === 'string') {
      this.#validatePath(httpMethod, routePath)
    }

    // finally creates route
    this.router[httpMethod](...args)
  }

  /**
   * Logs information about the request such as execution time.
   *
   * @param {number} startTimeMeasure  Timestamp of the beginning of this request's execution
   * @param {any[]}  args              Arguments sent to responseHandler
   */
  #logRequestInfo (startTimeMeasure, args) {
    const durationMeasure = performance.now() - startTimeMeasure
    const [request, response] = args

    logger.info(`[REQUEST_INFO] ${request.method} ${request.url} ${response.statusCode} +${durationMeasure.toFixed(2)}ms`)
  }

  /**
   * Validates defined url.
   *
   * @param {MethodType} method      Method Http
   * @param {string}     methodPath  Represents the path for the current route.
   */
  #validatePath (method, methodPath) {
    if (typeof methodPath !== 'string') throw new TypeError(`path must be String! Type: ${typeof methodPath}`)

    /**
     * Represents the base path for the current route.
     *
     * @type {string}
     */
    const basePath = this.path
      ? this.path
      : ''

    logger.debug(`Validating Route in ${this.appName}: ${method}: ${path.join(basePath, methodPath)}`)

    /**
     * @type {string} - hash created from the combination of method, basePath and methodPath for uniqueness validation
     */
    const h = [method, basePath, methodPath].toString()

    if (paths[h]) {
      throw new Error(`The route '${paths[h].method}: ${paths[h].path}', which is being defined in app '${this.appName}', has already been defined in the following app: '${paths[h].app}'`)
    } else {
      paths[h] = {
        method,
        path: path.join(basePath, methodPath),
        app: this.appName
      }
    }
  }

  /**
   * Renders a template using the Consolidate library (internally used by Express).
   * We use the library directly for greater control over the loaded directory.
   *
   * @see Consolidate.js: https://github.com/tj/consolidate.js
   * @see Handlebars: http://handlebarsjs.com/
   *
   * @param  {string}        templatePath  - The path of the template to be loaded.
   * @param  {object}        locals        - Variables available in the template and various configurations.
   * @param  {string}        [engine]      - The template engine to be used for rendering.
   *
   * @return {Promise<void>}               - A promise that resolves when the view rendering is complete.
   */
  async view (templatePath, locals = {}, engine = 'handlebars') {
    const viewPath = path.join(this.appPath, 'views', templatePath)
    return this.#renderView(viewPath, locals, engine)
  }

  /**
   * Loads a view template from another application/app.
   *
   * @param  {string}        applicationName  - The name of the application to load from.
   * @param  {string}        appName          - The name of the app where the template is located.
   * @param  {string}        templatePath     - The path of the template to be loaded.
   * @param  {object}        [locals]         - Variables available in the template and various configurations.
   * @param  {string}        [engine]         - The template engine to be used for rendering.
   *
   * @return {Promise<void>}                  - A promise that resolves when the view rendering is complete.
   * @throws {Error} - Throws an error if the specified application or app is not found.
   */
  async remoteView (applicationName, appName, templatePath, locals = {}, engine = 'handlebars') {
    if (!this.applicationsPath[applicationName]) {
      throw new Error(`Application '${applicationName}' not found. Available: (${Object.keys(this.applicationsPath)})`)
    }

    if (!this.applicationsPath[applicationName][appName]) {
      throw new Error(`App '${appName}' not found. Available: (${Object.keys(this.applicationsPath[applicationName])})`)
    }

    const viewPath = path.join(this.applicationsPath[applicationName][appName], 'views', templatePath)

    return this.#renderView(viewPath, locals, engine)
  }

  /**
   * Renderiza uma View.
   *
   * @param                  viewPath  {string}  Caminho da View
   * @param                  locals    {object}  Váraveis disponíveis no template e configurações diversas
   * @param                  engine    {string}  Engine de template a ser renderizado
   *
   * @return {Promise<void>}
   */
  async #renderView (viewPath, locals, engine) {
    const templateEngine = consolidate[engine]

    /// //////////////////////////////////////////////////////////////////////////////////////////////////////
    // Helpers para o template, são funcções que podem ser chamada no template para realizar determinada ação
    // Nota: Não é compatível com todos os templates (Atualmente handlerbars)
    /// //////////////////////////////////////////////////////////////////////////////////////////////////////
    locals.helpers = {

      /**
       * Retorna o caminho completo do  Asset passando apenas o nome do arquivo.
       * Baseado no app atual.
       *
       * Ex: imagem.png é convertido para static/[ApplicationName]/[AppName]/imagem.png
       *
       * @param               args
       *
       * @return {*|string|*}
       */
      '@asset': (...args) => {
        if (args.length === 2) {
          // (1) Argumento passado pelo usuario (assetPath)
          const [assetPath] = args
          return path.join(this.staticBaseUrl, this.applicationName, this.appName, assetPath)
        } else if (args.length === 3) {
          // (2) Argumentos passado pelo usuario (appName, assetPath)
          const [appName, assetPath] = args
          return path.join(this.staticBaseUrl, this.applicationName, appName, assetPath)
        } else if (args.length === 4) {
          // (3) Argumentos passado pelo usuario (applicationName, appName, assetPath)
          const [applicationName, appName, assetPath] = args
          return path.join(this.staticBaseUrl, applicationName, appName, assetPath)
        } else {
          throw new Error('Invalid number of arguments. Must be between 1 and 3')
        }
      }

    }

    return templateEngine(viewPath, locals)
  }
}
