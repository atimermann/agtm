/**
 *
 */
export default class HttpViewMixin {
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
//# sourceMappingURL=http-view-mixin.d.mts.map