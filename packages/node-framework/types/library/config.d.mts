/**
 * Class representing a unified configuration handler.
 * Configuration settings can be loaded from various sources
 * including .env files, system environment variables,
 * and YAML files with prioritization among them.
 */
export default class Config {
    /** @type {object} The merged configuration object. */
    static config: object;
    /**
     * Initialize the configuration object by loading and merging
     * configurations from various sources.
     */
    static init(): void;
    /**
     * Returns configuration exclusively from yaml (ignores ENV) and keeps case
     *
     * @param      key   The configuration key.
     * @param      type  The expected type of the configuration value.
     * @return {*}
     */
    static getYaml(key: any, type: any): any;
    /**
     * Get a configuration value by its key.
     *
     * @param  {string}  key       - The configuration key.
     * @param  {string}  [type]    - The expected type of the configuration value: number, boolean, string, array
     * @param  {boolean} yamlOnly  - Force load configuration from yaml configuration without losing case
     *
     * @throws Will throw an error if the configuration key is not found.
     * @return {*}                 The configuration value.
     */
    static get(key: string, type?: string, yamlOnly?: boolean): any;
    /**
     * Check if a value is a plain object.
     *
     * @param  {*}       obj  - The value to check.
     * @return {boolean}      Returns true if the value is a plain object, else false.
     */
    static _isPlainObject(obj: any): boolean;
    /**
     * Processa e disponibiliza váriaveis de ambiente para uso em envs
     *
     * @example
     *  Config.get('envs.node.env')
     *  Atalho para process.env.NODE_ENV
     *
     *  Se variavel de ambiente for prefixada com NF_, substitui configuração
     *
     *  @example
     *    NF_SOCKET_MODE substitui socket.mode
     *
     * @return object
     * @private
     */
    private static _processEnvVars;
    /**
     * Convert an environment object into a nested configuration object.
     *
     * @param  {object} env  - The environment object.
     * @return {object}      The nested configuration object.
     */
    static _envToNestedObject(env: object): object;
    /**
     * Transforms all keys of an object to lowercase.
     * If the object contains nested objects, the keys of those objects will also be transformed.
     *
     * @param  {object} obj  - The object whose keys should be transformed.
     * @return {object}      A new object with all keys transformed to lowercase.
     *
     * @private
     */
    private static _transformToLowerKeys;
}
//# sourceMappingURL=config.d.mts.map