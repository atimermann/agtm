/**
 * Class representing a unified configuration handler.
 * Configuration settings can be loaded from various sources
 * including .env files, system environment variables,
 * and YAML files with prioritization among them.
 */
export default class Config {
    /** @type {ConfigType} The merged configuration object. */
    static config: ConfigType;
    /**
     * Initialize the configuration object by loading and merging
     * configurations from various sources.
     */
    static init(): void;
    /**
     * Returns a configuration value exclusively from YAML, ignoring environment variables and keeping the original case.
     *
     * @param  {string}                              key     - The configuration key.
     * @param  {"number"|"boolean"|"string"|"array"} [type]  - The expected type of the configuration value.
     *                                                       Can be 'number', 'boolean', 'string', or 'array'.
     * @return {*}                                           The configuration value, casted to the specified type if provided.
     */
    static getYaml(key: string, type?: "number" | "boolean" | "string" | "array"): any;
    /**
     * Get a configuration value by its key.
     *
     * @param  {string}                              key         - The configuration key.
     * @param  {"number"|"boolean"|"string"|"array"} [type]      - The expected type of the configuration value.
     *                                                           Can be 'number', 'boolean', 'string', or 'array'.
     * @param  {boolean}                             [yamlOnly]  - If true, forces the configuration to be loaded from the YAML file only.
     *
     * @throws Will throw an error if the configuration key is not found or if the value type does not match the expected type.
     * @return {*}                                               The configuration value, casted to the specified type if provided.
     */
    static get(key: string, type?: "number" | "boolean" | "string" | "array", yamlOnly?: boolean): any;
    /**
     * Constructs a Data Source Name (DSN) string for database connection.
     *
     * This method dynamically constructs a DSN string based on the provided database configuration name.
     * It encodes the username and password to ensure special characters are properly handled.
     * The method also conditionally appends options to the DSN if they are provided.
     *
     * @param  {string} name  The base name of the database configuration keys.
     *                        This name is used to retrieve specific parts of the database configuration
     *                        such as provider, username, password, host, port, database name, and options.
     * @return {string}       The constructed DSN string which can be used to connect to the database.
     *                        The format of the returned DSN string is:
     *                        `provider://username:password@host:port/database?options`
     *                        where `options` are optional URL parameters.
     */
    static getDSN(name: string): string;
    /**
     * Check if a value is a plain object.
     *
     * @param  {*}       obj  - The value to check.
     * @return {boolean}      Returns true if the value is a plain object, else false.
     */
    static "__#1@#isPlainObject"(obj: any): boolean;
    /**
     * Processes and provides access to environment variables.
     * Environment variables prefixed with 'NF_' override corresponding configuration settings.
     *
     * @example
     *  Config.get('envs.node.env') // Shortcut for process.env.NODE_ENV
     *
     * @example
     *  // NF_SOCKET_MODE overrides socket.mode in configuration
     *  NF_SOCKET_MODE
     *
     * @return {ConfigType} Processed environment variables as a nested configuration object.
     */
    static "__#1@#processEnvVars"(): ConfigType;
    /**
     * Convert an environment object into a nested configuration object.
     *
     * @param  {object} env  - The environment object.
     * @return {object}      The nested configuration object.
     */
    static "__#1@#envToNestedObject"(env: object): object;
    /**
     * Transforms all keys of an object to lowercase.
     * If the object contains nested objects, the keys of those objects will also be transformed.
     *
     * @param  {ConfigType} obj  - The object whose keys should be transformed.
     * @return {ConfigType}      A new object with all keys transformed to lowercase.
     */
    static "__#1@#transformToLowerKeys"(obj: ConfigType): ConfigType;
}
/**
 * Represents a value in the configuration object.
 */
export type ConfigType = {
    [key: string]: ConfigValue;
};
/**
 * Created on 06/07/2023
 */
export type ConfigValue = string | number | boolean | any[] | {
    [key: string]: ConfigValue;
};
//# sourceMappingURL=config.d.mts.map