/**
 * ************* LEGADO: NÃO EXCLUIR, não foi transpilado à partir do config.ts ***************************
 *
 * Created on 06/07/2023
 *
 * @file
 * Unified configuration handler that loads and merges settings from .env files, environment variables, and YAML
 * configurations, providing a single point of access for application settings.
 *
 * @author André Timermann <andre@timermann.com.br>
 *
 * Represents a configuration object where keys are strings.
 * @typedef {{ [key: string]: ConfigValue }} ConfigType
 *
 * Represents a value in the configuration object.
 * @typedef {number | boolean | string | Array<any> | { [key: string]: ConfigValue }} ConfigValue
 */

import { config as dotenvConfig } from 'dotenv'
import yaml from 'js-yaml'

import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

import fs from 'node:fs'

import defaultsDeep from 'lodash/defaultsDeep.js'
import transform from 'lodash/transform.js'
import toLower from 'lodash/toLower.js'
import isPlainObject from 'lodash/isPlainObject.js'

const __dirname = dirname(fileURLToPath(import.meta.url))

dotenvConfig()

/**
 * Class representing a unified configuration handler.
 * Configuration settings can be loaded from various sources
 * including .env files, system environment variables,
 * and YAML files with prioritization among them.
 */
export default class Config {
  /** @type {ConfigType} The merged configuration object. */
  static config = {}

  /**
   * Initialize the configuration object by loading and merging
   * configurations from various sources.
   */
  static init () {
    const env = process.env.NODE_ENV || 'development'

    // Load default YAML config
    const defaultYamlConfig = yaml.load(fs.readFileSync(join(__dirname, '..', 'config.default.yaml'), 'utf8'))

    // Load the appropriate YAML config based on NODE_ENV
    const envYamlConfig = yaml.load(fs.readFileSync(join(__dirname, '..', `config.${env}.yaml`), 'utf8'))

    // Load YAML config from user Project
    const userYamlConfig = yaml.load(fs.readFileSync(join(process.cwd(), 'config.default.yaml'), 'utf8'))

    // Load YAML config from user Project based on NODE_ENV
    const envUserYamlConfig = yaml.load(fs.readFileSync(join(process.cwd(), `config.${env}.yaml`), 'utf8'))

    this.yamlConfig = defaultsDeep(
      envUserYamlConfig,
      userYamlConfig,
      envYamlConfig,
      defaultYamlConfig
    )

    // Merge defaultYaml, envYaml, process.env, and .env
    this.config =
      defaultsDeep(
        this.#processEnvVars(),
        this.#transformToLowerKeys(this.yamlConfig)
      )
  }

  /**
   * Returns a configuration value exclusively from YAML, ignoring environment variables and keeping the original case.
   *
   * @param  {string}                              key     - The configuration key.
   * @param  {"number"|"boolean"|"string"|"array"} [type]  - The expected type of the configuration value.
   *                                                       Can be 'number', 'boolean', 'string', or 'array'.
   * @return {*}                                           The configuration value, casted to the specified type if provided.
   */
  static getYaml (key, type) {
    return this.get(key, type, true)
  }

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
  static get (key, type, yamlOnly = false) {
    const parts = yamlOnly
      ? key.split('.')
      : key.toLowerCase().split('.')

    let current = yamlOnly
      ? this.yamlConfig
      : this.config

    for (const part of parts) {
      if (current[part] === undefined) {
        throw new Error(`Config key "${key}" not found`)
      }
      current = current[part]
    }

    // Check for "__value" only at the end
    if (current?.__value) {
      current = current.__value
    }

    // Convert to the specified type, if provided
    if (type !== undefined) {
      switch (type) {
        case 'number':
          return Number(current)
        case 'boolean':
          if (!['boolean', 'string'].includes(typeof current)) {
            throw new TypeError(`Attribute "${key}" must be of type boolean or string`)
          }
          return typeof current === 'boolean' ? current : current.toLowerCase() === 'true'
        case 'string':
          return String(current)
        case 'array':
          return Array.isArray(current)
            ? current
            : current?.split(':')
        default:
          throw new Error(`Unknown type "${type}"`)
      }
    }

    return current
  }

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
  static getDSN (name) {
    return `${this.get(`${name}.provider`)}://${encodeURIComponent(this.get(`${name}.username`))}:${encodeURIComponent(this.get(`${name}.password`))}@${this.get(`${name}.host`)}:${this.get(`${name}.port`)}/${this.get(`${name}.database`)}${this.get(`${name}.options`) ? `?${this.get(`${name}.options`)}` : ''}`
  }

  /**
   * Check if a value is a plain object.
   *
   * @param  {*}       obj  - The value to check.
   * @return {boolean}      Returns true if the value is a plain object, else false.
   */
  static #isPlainObject (obj) {
    return Object.prototype.toString.call(obj) === '[object Object]'
  }

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
  static #processEnvVars () {
    // Environment variables must have the NF prefix to replace application variables
    // Selects environment variables with NF_ prefix

    /**
     * @type {ConfigType}
     */
    const nfProcessEnv = {}
    for (const key of Object.keys(process.env)) {
      if (key.substring(0, 3) === 'NF_') {
        nfProcessEnv[key.substring(3)] = process.env[key]
      }
    }

    const envVars = this.#transformToLowerKeys(this.#envToNestedObject(nfProcessEnv))

    // Processes environment variables (protects application)
    envVars.envs = this.#transformToLowerKeys(this.#envToNestedObject(process.env))

    return envVars
  }

  /**
   * Convert an environment object into a nested configuration object.
   *
   * @param  {object} env  - The environment object.
   * @return {object}      The nested configuration object.
   */
  static #envToNestedObject (env) {
    const result = {}

    for (const key in env) {
      const value = env[key]
      const parts = key.toLowerCase().split('_')
      const last = parts.pop()

      let current = result
      for (const part of parts) {
        if (current[part] !== undefined && !this.#isPlainObject(current[part])) {
          current[part] = { __value: current[part] }
        } else if (!(part in current)) {
          current[part] = {}
        }
        current = current[part]
      }

      current[last] = value
    }

    return result
  }

  /**
   * Transforms all keys of an object to lowercase.
   * If the object contains nested objects, the keys of those objects will also be transformed.
   *
   * @param  {ConfigType} obj  - The object whose keys should be transformed.
   * @return {ConfigType}      A new object with all keys transformed to lowercase.
   */
  static #transformToLowerKeys (obj) {
    return transform(obj, (result, value, key) => {
      const newKey = toLower(key)

      result[newKey] = isPlainObject(value)
        ? this.#transformToLowerKeys(value)
        : value
    })
  }
}

Config.init()
