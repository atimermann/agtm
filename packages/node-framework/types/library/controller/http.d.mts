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
    router: {};
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
     *
     * @param {...any} args
     */
    all(...args: any[]): void;
    /**
     *
     * @param {...any} args
     */
    use(...args: any[]): void;
    /**
     *
     * @param {...any} args
     */
    post(...args: any[]): void;
    /**
     *
     * @param {...any} args
     */
    get(...args: any[]): void;
    /**
     *
     * @param {...any} args
     */
    put(...args: any[]): void;
    /**
     *
     * @param {...any} args
     */
    delete(...args: any[]): void;
    /**
     *
     * @param {...any} args
     */
    patch(...args: any[]): void;
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
    responseHandler(lastCallback: Function, request: object, response: object, ...args: any[]): Promise<void>;
    /**
     * Standardized error handling of the API, can be extended by the user to standardize or select errors that
     * will be displayed
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
     * Abstract method for Pre Middleware creation
     */
    pre(): Promise<void>;
    /**
     * TODO: migrar para ser executado em route  this.pos(<function>)
     * Abstract method for Post Middleware creation
     */
    pos(): Promise<void>;
    /**
     * Abstract Router method, used to configure Routes
     */
    setup(): Promise<void>;
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
    private _processRestMethod;
    /**
     * Logs information about the request such as execution time
     *
     * @param startTimeMeasure  {number}  Timestamp of the beginning of this request's execution
     * @param args              {array}   Arguments sent to responseHandler
     *
     * @private
     */
    private _logRequestInfo;
    /**
     * Validates defined url
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
    remoteView(applicationName: string, appName: string, templatePath: string, locals?: object, engine?: string): Promise<void>;
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
    private _renderView;
}
import BaseController from './base-controller.mjs';
//# sourceMappingURL=http.d.mts.map