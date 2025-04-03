/**
 * Created on 28/02/2025
 *
 * @author André Timermann
 *
 * @file
 * Plugin that validates requests using Keycloak.
 *
 * This plugin adds a preHandler hook to validate the access token on protected routes.
 * If a route has the configuration { auth: false } the authentication is skipped.
 * Otherwise, the token is validated and decoded via KeycloakService and the resulting
 * user information is attached to request.user.
 */

import type { FastifyInstance } from "fastify"
import type { AuthRequest } from "#/http/interfaces/authRequest.interface.ts"
import type { LoggerInterface } from "#/loggers/logger.interface.ts"

import { KeycloakError, KeycloakService } from "#/services/keycloakService.ts"
import { ApiError } from "#/http/errors/apiError.ts"
import type { ApiRouteOptionInterface } from "#/http/interfaces/apiRouteOption.interface.js"
import type { ConfigService } from "#/services/configService.js"

import { isDev } from "#/utils/tools.js"

export class KeycloakPlugin {
  private readonly keycloakService: KeycloakService

  constructor(
    private readonly logger: LoggerInterface,
    private readonly config: ConfigService,
    private readonly fastify: FastifyInstance,
    keyCloakService?: KeycloakService,
  ) {
    // TODO: Permitir personalizar instancia da configuração por rota
    this.keycloakService =
      keyCloakService ??
      new KeycloakService({
        baseUrl: this.config.get(`keycloak.base.url`),
        realm: this.config.get(`keycloak.realm`),
        clientId: this.config.get(`keycloak.client.id`),
        clientSecret: this.config.get(`keycloak.client.secret`),
      })
  }

  async setup() {
    this.fastify.decorate("auth", null)
    this.fastify.decorate("roles", null)
    this.fastify.addHook("preHandler", async (request: AuthRequest) => {
      try {
        const routeOptions = request.routeOptions as ApiRouteOptionInterface

        this.validateAuthIsDefined(routeOptions)

        // Rota publica
        if (!routeOptions.config?.auth) {
          return
        }

        const authHeader = request.headers.authorization

        const developmentAccessToken = await this.getDevelopmentAccessToken(authHeader)

        if (developmentAccessToken) {
          this.logger.warn("WARNING: 'AccessToken' automatically obtained via 'DevMode' of the Keycloak service.")
        }

        const clientAccessToken = developmentAccessToken ?? this.getToken(authHeader)

        const decodedToken = await this.keycloakService.validateUser(clientAccessToken)
        request.auth = decodedToken
        request.roles = this.getRoles(decodedToken, routeOptions)
      } catch (error: any) {
        if (error instanceof KeycloakError) {
          throw new ApiError(error.message, "Authentication Error", 401)
        }
        throw error
      }
    })

    this.logger.info("KeycloakAuthPlugin setup completed.")
  }

  /**
   * 1. Valida se rota está marcada para autenticação
   */
  private validateAuthIsDefined(routeOptions: ApiRouteOptionInterface) {
    if (routeOptions.config?.auth === null) {
      throw new ApiError(
        "If Keycloak plugin is enabled it is mandatory to define whether the route is authenticated or not!",
        "Missing Authentication Configuration",
      )
    }
  }

  /**
   * Extrai token do header da requisição fornecido pelo client
   *
   * @param authHeader
   * @private
   */
  private getToken(authHeader?: string): string {
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new ApiError("Unauthorized: No token provided", "Authentication Error", 400)
    }

    return authHeader.substring(7)
  }

  /**
   *
   * Retorna uma lista de todas as permissões(roles) do usuário, processando a access token decodificado
   * Permissões (roles) podem ser permissões do REAL, ou de um cliente, se for de um cliente ela é montada em duas parte
   * [NOME_DO_CLIENT].[ROLE]
   *
   * Retrieves clientRoles from the decoded token.
   * Aggregates clientRoles from both `resource_access` and `realm_access`.
   * For `resource_access`, it prefixes each role with the resource name (e.g., "account.AAA").
   * For `realm_access`, clientRoles are added as-is.
   * Roles containing a dot are ignored with a warning.
   *
   * @param decodedToken - The decoded JWT token.
   * @param routeOptions - Route options containing allowed clientRoles.
   *
   * @returns  An array of processed clientRoles.
   *
   * @throws {ApiError} If none of the clientRoles match allowed clientRoles specified in routeOptions.
   */
  private getRoles(decodedToken: any, routeOptions: ApiRouteOptionInterface): string[] {
    const clientRoles: string[] = [
      ...this.getResourceAccessRoles(decodedToken),
      ...this.getRealmAccessRoles(decodedToken),
    ]
    this.validateAllowedRoles(clientRoles, routeOptions)
    return clientRoles
  }

  /**
   * Processes clientRoles from `resource_access` by prefixing each role with the resource name.
   *
   * @param decodedToken - The decoded JWT token.
   *
   * @returns An array of clientRoles with resource prefixes.
   */
  private getResourceAccessRoles(decodedToken: any): string[] {
    const clientRoles: string[] = []
    const resourceAccess = decodedToken.resource_access || {}

    for (const resource in resourceAccess) {
      if (Object.prototype.hasOwnProperty.call(resourceAccess, resource)) {
        const resourceData = resourceAccess[resource]
        if (resourceData && Array.isArray(resourceData.roles)) {
          for (const role of resourceData.roles) {
            if (role.includes(".")) {
              this.logger.warn(`Permission containing '.' is not allowed and will be ignored: ${role}`)
              continue
            }
            clientRoles.push(`${resource}.${role}`)
          }
        }
      }
    }
    return clientRoles
  }

  /**
   * Processes clientRoles from `realm_access` and returns them as is.
   *
   * @param decodedToken - The decoded JWT token.
   *
   * @returns  An array of clientRoles from realm_access.
   */
  private getRealmAccessRoles(decodedToken: any): string[] {
    const clientRoles: string[] = []
    if (decodedToken.realm_access && Array.isArray(decodedToken.realm_access.roles)) {
      for (const role of decodedToken.realm_access.roles) {
        if (role.includes(".")) {
          this.logger.warn(`Permission containing '.' is not allowed and will be ignored: ${role}`)
          continue
        }
        clientRoles.push(role)
      }
    }
    return clientRoles
  }

  /**
   * Validates if any of the aggregated clientRoles match the allowed clientRoles in the route options.
   *
   * @param clientRoles   - The aggregated clientRoles.
   * @param routeOptions  - Route options containing allowed clientRoles.
   *
   * @throws {ApiError} If none of the clientRoles match the allowed clientRoles.
   */
  private validateAllowedRoles(clientRoles: string[], routeOptions: ApiRouteOptionInterface): void {
    if (routeOptions.config?.roles) {
      const allowedRoles: string[] = routeOptions.config.roles
      const hasAllowedRole = allowedRoles.some((allowedRole) => clientRoles.includes(allowedRole))
      if (!hasAllowedRole) {
        throw new ApiError(
          "Forbidden: Insufficient permissions",
          "Authorization Error",
          403,
          `Required permissions: ${allowedRoles.join(", ")}.\n Provided permissions: ${clientRoles.join(", ")}`,
        )
      }
    }
  }

  /**
   * Carrega token automaticamente no ambiente de desenvolvimento UTILIZAR APENAS EM AMBIENTE DESENVOLVIMENTO
   *
   * @param authHeader
   * @private
   */
  private async getDevelopmentAccessToken(authHeader?: string) {
    const autoLogin = this.config.get("httpServer2.plugins.keycloak.devMode.enabled", "boolean")
    if (!isDev() && autoLogin) {
      throw new Error("Do not use 'devMode' in a different environment of development.")
    }

    if (
      isDev() &&
      this.config.get("httpServer2.plugins.keycloak.devMode.enabled", "boolean") &&
      (!authHeader || !authHeader.startsWith("Bearer "))
    ) {
      const username: string = this.config.get("httpServer2.plugins.keycloak.devMode.username")
      const password: string = this.config.get("httpServer2.plugins.keycloak.devMode.password")
      const clientId: string = this.config.get("httpServer2.plugins.keycloak.devMode.clientId")

      const authInfo = await this.keycloakService.frontAuthentication(username, password, clientId)
      return authInfo.access_token
    }
  }
}
