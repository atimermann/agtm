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
   * Creates an instance of KeycloakCLI.
   *
   * @param configName Prefix for configuration in .env file (e.g., for "keycloak", it reads NF_KEYCLOAK_BASE_URL)
   * @param config Optional ConfigService instance
   * @param keycloakService Optional KeycloakService instance
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
      const adminToken = await this.keycloakService.getAccessToken()
      console.log("✅ Successfully connected to Keycloak.")
      console.log("🔑 Access Token:", adminToken.slice(0, 20))
    } catch (error) {
      // @ts-ignore
      console.error("❌ Connection to Keycloak failed:", error.message)
      console.error(
        "❌ Verifique configuração em: https://[HOSTNAME]/realms/[REALM]/.well-known/openid-configuration pelo link da interface do Keycloak",
      )
      process.exit(1)
    }
  }

  /**
   * Simulates front-end authentication test using user provided credentials.
   *
   * @param username - The user's username.
   * @param password - The user's password.
   * @param clientId - The client ID for authentication.
   * @returns The authentication response.
   */
  async simulateFrontAuth(username: string, password: string, clientId: string) {
    const result = await this.keycloakService.frontAuthentication(username, password, clientId)
    console.log("✅ Front-end authentication successful.")
    console.log("🔑 Access Token:\n", result)
    process.exit(1)
  }

  /**
   * Simulates front-end authentication test using user provided credentials.
   *
   * @returns The authentication response.
   * @param accessToken
   */
  async validateUser(accessToken: string) {
    const result = await this.keycloakService.validateUser(accessToken)
    console.log("✅ Front-end user Valid.")
    console.log("🔑 User info::\n", result)
    process.exit(1)
  }

  /**
   * Complete user authentication teste
   *
   * @param username - The user's username.
   * @param password - The user's password.
   * @param clientId - The client ID for authentication.
   */
  async testUser(username: string, password: string, clientId: string) {
    const authResult = await this.keycloakService.frontAuthentication(username, password, clientId)
    const accessToken = authResult.access_token
    const userInfo = await this.keycloakService.validateUser(accessToken)
    console.log("✅ Success:")
    console.log("🔑 Access Token:", accessToken)
    console.log("👤 User Info:", userInfo)
    process.exit(1)
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

  /**
   * Displays a list of available commands.
   */
  static showAvailableCommands() {
    console.log("\n📌 Available Commands:\n")
    Object.getOwnPropertyNames(KeycloakCLI.prototype)
      .filter((methodName) => methodName !== "constructor" && methodName !== "execute")
      .forEach((methodName) => {
        // @ts-ignore
        const method = KeycloakCLI.prototype[methodName]
        const methodStr = method.toString()
        const argsMatch = methodStr.match(/\(([^)]*)\)/)
        let args = ""
        if (argsMatch && argsMatch[1]) {
          args = argsMatch[1]
            .split(",")
            .map((arg: string) => `[${arg.trim()}]`)
            .filter(Boolean)
            .join(" ")
        }
        // Convert camelCase method name to kebab-case for display
        const kebabName = methodName.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase()
        console.log(`\t👉 \x1b[1m${kebabName}\x1b[0m ${args}`)
      })
    console.log("\nUsage: cli.ts <function> [args...]\n")
  }
  /**
   * Main function to handle CLI arguments and invoke the appropriate method.
   */
  static async run() {
    const args = process.argv.slice(2)
    const cli = new KeycloakCLI()
    if (args.length < 1) {
      console.error("❌ No command provided.")
      KeycloakCLI.showAvailableCommands()
      process.exit(1)
    }
    // Convert command-line function name from kebab-case to camelCase.
    const functionName = args[0].replace(/-([a-z])/g, (_, letter) => letter.toUpperCase())
    const functionArgs = args.slice(1)
    await cli.execute(functionName, functionArgs)
  }
}

await KeycloakCLI.run()
