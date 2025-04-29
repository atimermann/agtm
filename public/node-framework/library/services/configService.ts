/**
 * **Created on 12/03/2025**
 * @author André Timermann <andre@timermann.com.br>
 *
 * @file
 * Unified configuration handler that loads and merges settings from .env files, environment variables, and YAML
 * configurations, providing a single point of access for application settings.
 *
 */
import { config as dotenvConfig } from "dotenv"
import yaml from "js-yaml"

import { dirname, resolve, join } from "node:path"
import { fileURLToPath } from "node:url"

import fs from "node:fs"

import defaultsDeep from "lodash/defaultsDeep.js"
import transform from "lodash/transform.js"
import toLower from "lodash/toLower.js"
import isPlainObject from "lodash/isPlainObject.js"

export type ConfigValue = number | boolean | string | Array<any> | { [key: string]: ConfigValue }
export type ConfigType = { [key: string]: ConfigValue }
export type ValueType = "number" | "boolean" | "string" | "array"

const rootPath = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..")
dotenvConfig()

export class ConfigService {
  private readonly config: ConfigType = {}
  private readonly yamlConfig: ConfigType = {}

  constructor() {
    const env = process.env.NODE_ENV || "development"

    const defaultYamlConfig = yaml.load(
      fs.readFileSync(join(rootPath, "config.default.yaml"), "utf8"),
    ) as ConfigType
    const envYamlConfig = yaml.load(
      fs.readFileSync(join(rootPath, `config.${env}.yaml`), "utf8"),
    ) as ConfigType
    const userYamlConfig = yaml.load(
      fs.readFileSync(join(process.cwd(), "config.default.yaml"), "utf8"),
    ) as ConfigType
    const envUserYamlConfig = yaml.load(
      fs.readFileSync(join(process.cwd(), `config.${env}.yaml`), "utf8"),
    ) as ConfigType

    this.yamlConfig = defaultsDeep(
      envUserYamlConfig,
      userYamlConfig,
      envYamlConfig,
      defaultYamlConfig,
    ) as ConfigType

    this.config = defaultsDeep(
      this.processEnvVars(),
      this.transformToLowerKeys(this.yamlConfig),
    ) as ConfigType
  }

  /**
   * Retrieves a configuration value from YAML only.
   *
   * @param key   - The configuration key.
   * @param type  - The expected type of the configuration value.
   *
   * @returns The configuration value cast to the specified type if provided.
   */
  getYaml(key: string, type?: ValueType): any {
    return this.get(key, type, true)
  }

  /**
   * Retrieves a configuration value by its key.
   *
   * @param key       - The configuration key.
   * @param type      - The expected type of the configuration value.
   * @param yamlOnly  - If `true`, the configuration will be loaded exclusively from YAML files.
   *
   * @throws If the configuration key is not found.
   *
   * @returns The configuration value cast to the specified type if provided.
   */
  get(key: string, type?: ValueType, yamlOnly = false): any {
    const parts = yamlOnly ? key.split(".") : key.toLowerCase().split(".")

    let current: any = yamlOnly ? this.yamlConfig : this.config

    for (const part of parts) {
      if (current[part] === undefined) {
        throw new Error(
          `Config key "${key}" not found. Check that the environment has defined: "NF_${key.toUpperCase().replace(/\./g, "_")}"`,
        )
      }
      current = current[part]
    }

    if (current?.__value) {
      current = current.__value
    }

    if (type !== undefined) {
      switch (type) {
        case "number":
          return Number(current)
        case "boolean":
          if (!["boolean", "string"].includes(typeof current)) {
            throw new TypeError(`Attribute "${key}" must be of type boolean or string`)
          }
          return typeof current === "boolean" ? current : current.toLowerCase() === "true"
        case "string":
          return String(current)
        case "array":
          return Array.isArray(current) ? current : current?.split(":")
        default:
          throw new Error(`Unknown type "${type}"`)
      }
    }

    return current
  }

  /**
   * Constructs a Data Source Name (DSN) string for database connections.
   *
   * @param name - The base name of the database configuration keys.
   *
   * @returns The constructed DSN string formatted as `provider://username:password@host:port/database?options`.
   */
  getDSN(name: string): string {
    return `${this.get(`${name}.provider`)}://${encodeURIComponent(this.get(`${name}.username`))}:${encodeURIComponent(this.get(`${name}.password`))}@${this.get(`${name}.host`)}:${this.get(`${name}.port`)}/${this.get(`${name}.database`)}${this.get(`${name}.options`) ? `?${this.get(`${name}.options`)}` : ""}`
  }

  /**
   * Checks if a value is a plain object.
   *
   * @param obj - The value to check.
   *
   * @returns `true` if the value is a plain object, otherwise `false`.
   */
  private isPlainObject(obj: any): boolean {
    return Object.prototype.toString.call(obj) === "[object Object]"
  }

  /**
   * Processes environment variables and provides access to them.
   * Environment variables prefixed with `NF_` override corresponding configuration settings.
   *
   * @returns A nested configuration object constructed from environment variables.
   */
  private processEnvVars(): ConfigType {
    const nfProcessEnv: Record<string, string> = {}

    for (const key of Object.keys(process.env)) {
      if (key.startsWith("NF_")) {
        nfProcessEnv[key.substring(3)] = process.env[key] as string
      }
    }

    const envVars = this.transformToLowerKeys(this.envToNestedObject(nfProcessEnv))
    envVars.envs = this.transformToLowerKeys(
      this.envToNestedObject(process.env as Record<string, string>),
    )

    return envVars
  }

  /**
   * Converts an environment object into a nested configuration object.
   *
   * @param env - The environment object.
   *
   * @returns The nested configuration object.
   */
  private envToNestedObject(env: Record<string, string>): ConfigType {
    const result: ConfigType = {}

    for (const key in env) {
      const value = env[key]
      const parts = key.toLowerCase().split("_")
      const last = parts.pop() as string

      let current: any = result

      for (const part of parts) {
        if (current[part] !== undefined && !this.isPlainObject(current[part])) {
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
   * If the object contains nested objects, their keys will also be transformed.
   *
   * @param obj - The object whose keys should be transformed.
   *
   * @returns A new object with all keys transformed to lowercase.
   */
  private transformToLowerKeys(obj: any): ConfigType {
    return transform(obj, (result: any, value: any, key: string) => {
      const newKey = toLower(key)
      result[newKey] = isPlainObject(value) ? this.transformToLowerKeys(value) : value
    }) as ConfigType
  }
}
