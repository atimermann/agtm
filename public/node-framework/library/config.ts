import { ConfigService } from "#/services/configService.js"
import type { ValueType } from "#/services/configService.js"

/**
 * @deprecated Use `ConfigService` instead.
 * This class is maintained only for backward compatibility and will be removed in future versions.
 */
export class Config {
  private static configService = new ConfigService()

  /** @deprecated Use `ConfigService` instead. */
  static init(): void {
    console.warn("⚠️  Config class is deprecated. Use ConfigService instead.")
  }

  /** @deprecated Use `ConfigService.getYaml()` instead. */
  static getYaml(key: string, type?: ValueType): any {
    return this.configService.getYaml(key, type)
  }

  /** @deprecated Use `ConfigService.get()` instead. */
  static get(key: string, type?: ValueType, yamlOnly = false): any {
    return this.configService.get(key, type, yamlOnly)
  }

  /** @deprecated Use `ConfigService.getDSN()` instead. */
  static getDSN(name: string): string {
    return this.configService.getDSN(name)
  }
}
