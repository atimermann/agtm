/**
 *
 */
export default class HttpController extends BaseController {
    /**
     * The Express Router object. Defined in the http-server, it should not be modified directly.
     *
     * @type {ExpressRouter}
     */
    router: ExpressRouter;
    /**
     * Base path of the application, ex: /api/v1/clients
     * Works as a prefix, not requiring to always put the complete route
     *
     * @type {string}
     */
    path: string;
    /**
     * URL base padrão  para acesso a recursos estáticos.
     * Será usado pelo Helper @asset, que calcula automaticamente a url do recurso que será carregado na página
     *
     * Definido em http-server
     *
     * @type {string}
     */
    staticBaseUrl: string;
    /**
     * All Route.
     *
     * @param {string} path      - The path for the POST request.
     * @param {...any} handlers  - A series of numbers (handlers).
     */
    all(path: string, ...handlers: any[]): void;
    /**
     * Defines a route for HTTP POST requests.
     *
     * @param {HandlerArgument[]} handlers  - A series of numbers (handlers).
     */
    use(...handlers: HandlerArgument[]): void;
    /**
     * Defines a route for HTTP POST requests.
     *
     * @param {string}            path      - The path for the POST request.
     * @param {HandlerArgument[]} handlers  - A series of numbers (handlers).
     */
    post(path: string, ...handlers: HandlerArgument[]): void;
    /**
     * Defines a route for HTTP GET requests.
     *
     * @param {string}            path      - The path for the POST request.
     * @param {HandlerArgument[]} handlers  - A series of numbers (handlers).
     */
    get(path: string, ...handlers: HandlerArgument[]): void;
    /**
     * Defines a route for HTTP PUT requests.
     *
     * @param {string}            path      - The path for the POST request.
     * @param {HandlerArgument[]} handlers  - A series of numbers (handlers).
     */
    put(path: string, ...handlers: HandlerArgument[]): void;
    /**
     * Defines a route for HTTP DELETE requests.
     *
     * @param {string}            path      - The path for the POST request.
     * @param {HandlerArgument[]} handlers  - A series of numbers (handlers).
     */
    delete(path: string, ...handlers: HandlerArgument[]): void;
    /**
     * Defines a route for HTTP PATCH requests.
     *
     * @param {string}            path      - The path for the POST request.
     * @param {HandlerArgument[]} handlers  - A series of numbers (handlers).
     */
    patch(path: string, ...handlers: HandlerArgument[]): void;
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
    responseHandler(lastCallback: Function, request: ExpressRequest, response: ExpressResponse, ...args: any[]): Promise<void>;
    /**
     * Standardized error handling of the API, can be extended by the user to standardize or select errors that
     * will be displayed.
     *
     * @param                                                                       err
     * @return {Promise<{errorInfo: {error: boolean, message: *}, status: number}>}
     */
    errorHandler(err: any): Promise<{
        errorInfo: {
            error: boolean;
            message: any;
        };
        status: number;
    }>;
    /**
     * TODO: migrar para ser executado em route  this.pre(<function>)
     *
     * Abstract method for Pre Middleware creation.
     */
    pre(): Promise<void>;
    /**
     * TODO: migrar para ser executado em route  this.pos(<function>)
     * Abstract method for Post Middleware creation.
     */
    pos(): Promise<void>;
    /**
     * Abstract Router method, used to configure Routes.
     */
    setup(): Promise<void>;
    /**
     * Logs information about the request such as execution time.
     *
     * @param startTimeMeasure  {number}  Timestamp of the beginning of this request's execution
     * @param args              {array}   Arguments sent to responseHandler
     *
     * @private
     */
    private _logRequestInfo;
    /**
     * Validates defined url.
     *
     * @param method
     * @param methodPath
     * @private
     */
    private _validatePath;
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
    view(templatePath: string, locals?: object, engine?: string): Promise<void>;
    /**
     * Permite Carregar View de outra aplicação/app.
     *
     * @param                  applicationName  {string}  Nome da aplicação
     * @param                  appName          {string}  Nome do app onde o template está
     * @param                  templatePath     {string}  Template a ser carregado
     * @param                  locals           {object}  Váraveis disponíveis no template e configurações diversas
     * @param                  engine           {string}  Engine de template a ser renderizado
     *
     * @return {Promise<void>}
     */
    remoteView(applicationName: string, appName: string, templatePath: string, locals?: object, engine?: string): Promise<void>;
    /**
     * Renderiza uma View.
     *
     * @param                  viewPath  {string}  Caminho da View
     * @param                  locals    {object}  Váraveis disponíveis no template e configurações diversas
     * @param                  engine    {string}  Engine de template a ser renderizado
     *
     * @return {Promise<void>}
     * @private
     */
    private _renderView;
    #private;
}
/**
 * - Importing the Express module for type definitions.
 */
export type Express = typeof import("express");
/**
 * - Importing the Router type from Express.
 */
export type ExpressRouter = import('express').Router;
/**
 * - Importing the Request type from Express.
 */
export type ExpressRequest = import('express').Request;
/**
 * - Importing the Response type from Express.
 */
export type ExpressResponse = import('express').Response;
/**
 * Created on 28/07/23
 */
export type ExpressPathParams = typeof import("express");
/**
 * Created on 28/07/23
 */
export type PathArgument = (string | RegExp | Array<string | RegExp>);
/**
 * Created on 28/07/23
 */
export type RequestHandler = import('express').RequestHandler;
/**
 * Created on 28/07/23
 */
export type ErrorHandler = import('express').ErrorRequestHandler;
/**
 * Created on 28/07/23
 */
export type Handler = RequestHandler;
/**
 * Created on 28/07/23
 */
export type HandlerArgument = Handler | Handler[];
import BaseController from './base-controller.mjs';
//# sourceMappingURL=http.d.mts.map