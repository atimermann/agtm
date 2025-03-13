#!/usr/bin/env -S node --experimental-strip-types --no-warnings
/**
 * cli.ts
 *
 * CLI script for interacting with Keycloak Admin API.
 * Now implemented as a class to ensure only valid methods are executed.
 */

import { ConfigService } from "../library/services/configService.ts"
import { KeycloakService } from "../library/services/keycloakService.ts"
import * as process from "node:process"
import * as console from "node:console"

class KeycloakCLI {
  private keycloakService: KeycloakService
  private config: ConfigService

  /**
   *
   * @param configName  Prefixo da configuração no arquivo .env, exemplo, para "keycloak" vai ler NF_KEYCLOAK_BASE_URL
   * @param config
   *
   * @param keycloakService
   */
  constructor(configName = "keycloak", config?: ConfigService, keycloakService?: KeycloakService) {
    this.config = config ?? new ConfigService()
    this.keycloakService =
      keycloakService ??
      new KeycloakService({
        baseUrl: this.config.get(`${configName}.base.url`),
        realm: this.config.get(`${configName}.realm`),
        clientId: this.config.get(`${configName}.client.id`),
        clientSecret: this.config.get(`${configName}.client.secret`),
      })
  }

  /**
   * Test connection with Keycloak.
   */
  async testConnection() {
    try {
      const adminToken = await this.keycloakService.getAdminToken()
      console.log("✅ Successfully connected to Keycloak.")
      console.log("🔑 Admin Token:", adminToken.slice(0, 20))
    } catch (error) {
      // @ts-ignore
      console.error("❌ Connection to Keycloak failed:", error.message)
      console.error(
        "❌ Verifique configuração em: https://[HOSTNAME]/realms/[REALM]/.well-known/openid-configuration pelo link" +
          " da interface do Keycloak",
      )
      process.exit(1)
    }
  }

  /**
   * Calls a method dynamically if it exists within this class.
   *
   * @param methodName The method to execute.
   * @param args The arguments to pass to the method.
   */
  async execute(methodName: string, args: string[]) {
    // @ts-ignore
    if (typeof this[methodName] === "function") {
      try {
        // @ts-ignore
        const result = await this[methodName](...args)

        if (result) {
          console.log("✅ Result:", result)
        }
      } catch (error) {
        // @ts-ignore
        console.error(`❌ Error executing "${methodName}":`, error.message)
        process.exit(1)
      }
    } else {
      console.error(`❌ Method "${methodName}" not found in KeycloakCLI`)
      process.exit(1)
    }
  }
}

// TODO: Se precisar criar mais scripts então criar uma classe pai e colocar o código abaixo nele e chamar só main mais execute
/**
 * Display a list of available commands.
 */
function showAvailableCommands() {
  console.log("\n📌 Available Commands:")
  Object.getOwnPropertyNames(KeycloakCLI.prototype)
    .filter((method) => method !== "constructor" && method !== "execute")
    .forEach((method) => console.log(`  ${method}`))
  console.log("\nUsage: cli.ts <function> [args...]\n")
}

/**
 * Main function to handle CLI arguments and invoke the appropriate method.
 */
async function main() {
  const args = process.argv.slice(2)

  const cli = new KeycloakCLI()

  if (args.length < 1) {
    console.error("❌ No command provided.")
    showAvailableCommands()
    process.exit(1)
  }

  const functionName = args[0] // The function name
  const functionArgs = args.slice(1) // Remaining arguments

  await cli.execute(functionName, functionArgs)
}

await main()
