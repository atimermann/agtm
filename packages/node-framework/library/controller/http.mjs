/**
 * Created on 28/07/23
 *
 * library/controller/http-mixin.mjs
 *
 * @author André Timermann <andre@timermann.com.br>
 */

import path from 'node:path'

import createLogger from '../../library/logger.mjs'
import { performance } from 'node:perf_hooks'
import BaseController from './base-controller.mjs'
import consolidate from 'consolidate'
const logger = createLogger('Controller')

const paths = {}

/**
 *
 */
export default class HttpController extends BaseController {
  /**
   * Objeto Router Express
   * Definido em http-server, não alterar
   *
   * @type {{}}
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
   *
   * @param {...any} args
   */
  all (...args) {
    this._processRestMethod('all', ...args)
  }

  /**
   *
   * @param {...any} args
   */
  use (...args) {
    this._processRestMethod('use', ...args)
  }

  /**
   *
   * @param {...any} args
   */
  post (...args) {
    this._processRestMethod('post', ...args)
  }

  /**
   *
   * @param {...any} args
   */
  get (...args) {
    this._processRestMethod('get', ...args)
  }

  /**
   *
   * @param {...any} args
   */
  put (...args) {
    this._processRestMethod('put', ...args)
  }

  /**
   *
   * @param {...any} args
   */
  delete (...args) {
    this._processRestMethod('delete', ...args)
  }

  /**
   *
   * @param {...any} args
   */
  patch (...args) {
    this._processRestMethod('patch', ...args)
  }

  /**
   * Asynchronous function designed to handle the responses of the Express.js framework.
   * Executes a callback function that defines the API, handles potential errors, and sends appropriate HTTP responses.
   *
   * @async
   * @function
   * @param  {Function}      lastCallback  - The callback function that handles the HTTP request and generates a response.
   *                                       This function is expected to be asynchronous and take in Express's request and
   *                                       response objects, along with any additional arguments.
   * @param  {object}        request       - The Express.js Request object, which contains all the information about the incoming
   *                                       HTTP request, such as headers, query parameters, and body.
   * @param  {object}        response      - The Express.js Response object, used to formulate and send an HTTP response to the client.
   * @param  {...any}        args          - Additional arguments that the `lastCallback` function may require.
   * @return {Promise<void>}               A Promise that resolves when the response has been sent. If an error occurs in the callback,
   *                                       the Promise rejects with the error, and an error response is sent to the client.
   * @throws Will throw an error if the `lastCallback` function throws an error. The error is also logged to the console
   *         and to a logger, including the error message and stack trace.
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
   * Standardized error handling of the API, can be extended by the user to standardize or select errors that
   * will be displayed
   *
   * @param                                                                       err
   * @return {Promise<{errorInfo: {error: boolean, message: *}, status: number}>}
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
   * Abstract method for Pre Middleware creation
   */
  async pre () {
    logger.debug(`Pre Middleware not implemented in ${this.completeIndentification}.`)
  }

  /**
   * TODO: migrar para ser executado em route  this.pos(<function>)
   * Abstract method for Post Middleware creation
   */
  async pos () {
    logger.debug(`Post Middleware not implemented in ${this.completeIndentification}.`)
  }

  /**
   * Abstract Router method, used to configure Routes
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
   * @private
   * @function
   * @param  {string} httpMethod  - The HTTP method to be processed.
   * @param  {...any} args        - An array of arguments for the method, which include callbacks
   *                              defined by the user to be used as middleware.
   * @return {void}               - This method does not return a value.
   *
   * @throws {TypeError} Throws an error if the first argument of the method (routePath)
   *                     is not a string, meaning it's a pathless method like 'use'.
   */
  _processRestMethod (httpMethod, ...args) {
    // Gets last callback and modifies to handle returns
    const lastCallback = args.pop()

    if (typeof lastCallback === 'function') {
      // replaces last callback with a function that processes the last callback (responseHandler)
      args.push(async (...args) => {
        const startTimeMeasure = performance.now()
        await this.responseHandler(lastCallback, ...args)
        this._logRequestInfo(startTimeMeasure, args)
      })
    } else {
      args.push(lastCallback)
    }

    const routePath = args[0]

    // Validates if the path has already been used in another controller, if args[0] is not a string it is a pathless
    // method like use
    if (typeof routePath === 'string') {
      this._validatePath(httpMethod, routePath)
    }

    // finally creates route
    this.router[httpMethod](...args)
  }

  /**
   * Logs information about the request such as execution time
   *
   * @param startTimeMeasure  {number}  Timestamp of the beginning of this request's execution
   * @param args              {array}   Arguments sent to responseHandler
   *
   * @private
   */
  _logRequestInfo (startTimeMeasure, args) {
    const durationMeasure = performance.now() - startTimeMeasure
    const [request, response] = args

    logger.info(`[REQUEST_INFO] ${request.method} ${request.url} ${response.statusCode} +${durationMeasure.toFixed(2)}ms`)
  }

  /**
   * Validates defined url
   *
   * @param method
   * @param methodPath
   * @private
   */
  _validatePath (method, methodPath) {
    if (typeof methodPath !== 'string') throw new TypeError(`path must be String! Type: ${typeof methodPath}`)

    const basePath = this.path
      ? this.path
      : ''

    logger.debug(`Validating Route in ${this.appName}: ${method}: ${path.join(basePath, methodPath)}`)

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
   * Renderiza um template usando a biblioteca Consolidate. (Usada pelo express internamente)
   *
   * Usanmos a bilioteca diretamente para ter mais controle sobre o diretório carregado
   *
   * Reference: https://github.com/tj/consolidate.js
   * Reference: http://handlebarsjs.com/
   *
   * @param                  templatePath  {string}  Template a ser carregado
   * @param                  locals        {object}  Váraveis disponíveis no template e configurações diversas
   * @param                  engine        {string}  Engine de template a ser renderizado
   *
   * @return {Promise<void>}
   */
  async view (templatePath, locals = {}, engine = 'handlebars') {
    const viewPath = path.join(this.appPath, 'views', templatePath)
    return this._renderView(viewPath, locals, engine)
  }

  /**
   * Permite Carregar View de outra aplicação/app
   *
   * @param                  applicationName  {string}  Nome da aplicação
   * @param                  appName          {string}  Nome do app onde o template está
   * @param                  templatePath     {string}  Template a ser carregado
   * @param                  locals           {object}  Váraveis disponíveis no template e configurações diversas
   * @param                  engine           {string}  Engine de template a ser renderizado
   *
   * @return {Promise<void>}
   */
  async remoteView (applicationName, appName, templatePath, locals = {}, engine = 'handlebars') {
    if (!this.applicationsPath[applicationName]) {
      throw new Error(`Application '${applicationName}' not found. Available: (${Object.keys(this.applicationsPath)})`)
    }

    if (!this.applicationsPath[applicationName][appName]) {
      throw new Error(`App '${appName}' not found. Available: (${Object.keys(this.applicationsPath[applicationName])})`)
    }

    const viewPath = path.join(this.applicationsPath[applicationName][appName], 'views', templatePath)

    return this._renderView(viewPath, locals, engine)
  }

  /**
   * Renderiza uma View
   *
   * @param                  viewPath  {string}  Caminho da View
   * @param                  locals    {object}  Váraveis disponíveis no template e configurações diversas
   * @param                  engine    {string}  Engine de template a ser renderizado
   *
   * @return {Promise<void>}
   * @private
   */
  async _renderView (viewPath, locals, engine) {
    const templateEngine = consolidate[engine]

    /// //////////////////////////////////////////////////////////////////////////////////////////////////////
    // Helpers para o template, são funcções que podem ser chamada no template para realizar determinada ação
    // Nota: Não é compatível com todos os templates (Atualmente handlerbars)
    /// //////////////////////////////////////////////////////////////////////////////////////////////////////
    locals.helpers = {

      /**
       * Retorna o caminho completo do  Asset passando apenas o nome do arquivo
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
