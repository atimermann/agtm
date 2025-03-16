/**
 * **Created on 12/03/2025**
 * @author André Timermann <andre@timermann.com.br>
 *
 * @file
 * Service for interacting with the Keycloak Admin API using the client_credentials grant.
 * This service uses the native Fetch API available in Node.js v22+.
 */

/*
  Nota:  Acesso à lista de URLs de acesso:
  https://auth.teste.com.br/realms/teste/.well-known/openid-configuration
*/

/**
 * Defines the structure for Keycloak configuration.
 */
export interface KeycloakConfig {
  baseUrl: string
  realm: string
  clientId: string
  clientSecret: string
}

/**
 * Custom error type for Keycloak-related errors intended to be shown to the user.
 */
export class KeycloakError extends Error {

  constructor(message: string) {
    super(message)
    this.name = "KeycloakError"
  }
}

export class KeycloakService {
  private readonly baseUrl: string
  private readonly realm: string
  private readonly clientId: string
  private readonly clientSecret: string

  constructor(keycloakConfig: KeycloakConfig) {
    this.baseUrl = keycloakConfig.baseUrl
    this.realm = keycloakConfig.realm
    this.clientId = keycloakConfig.clientId
    this.clientSecret = keycloakConfig.clientSecret
  }

  /**
   * Private helper method to send HTTP requests.
   *
   * @param url The URL to request.
   * @param method HTTP method.
   * @param body Optional request payload. If it's not an instance of URLSearchParams, it will be JSON-stringified.
   * @param additionalHeaders Optional extra headers to merge.
   * @returns Parsed JSON response.
   *
   * @throws An error if the response is not OK.
   */
  private async sendRequest(
    url: string,
    method: string,
    body?: any,
    additionalHeaders: Record<string, string> = {},
  ): Promise<any> {
    const headers: Record<string, string> = {}

    if (body) {
      if (body instanceof URLSearchParams) {
        headers["Content-Type"] = "application/x-www-form-urlencoded"
      } else {
        headers["Content-Type"] = "application/json"
        body = JSON.stringify(body)
      }
    }

    Object.assign(headers, additionalHeaders)

    const options: RequestInit = { method, headers }
    if (body) options.body = body

    const response = await fetch(url, options)

    if (!response.ok) {
      throw new Error(`Request failed: ${response.status} ${response.statusText}`)
    }

    return response.json()
  }

  /**
   * Retrieves an admin access accessToken from Keycloak using the client credentials grant.
   * @returns {Promise<string>} A promise that resolves to the admin access accessToken.
   */
  public async getAccessToken(): Promise<string> {
    const tokenUrl = `${this.baseUrl}/realms/${this.realm}/protocol/openid-connect/token`
    console.log(`Conectando à ${tokenUrl}...`)

    const params = new URLSearchParams()
    params.append("grant_type", "client_credentials")
    params.append("client_id", this.clientId)
    params.append("client_secret", this.clientSecret)

    const data = await this.sendRequest(tokenUrl, "POST", params)
    return data.access_token as string
  }

  /**
   * Introspects an access accessToken to verify if it's valid.
   *
   * @param accessToken - The accessToken to validate.
   *
   * @returns A promise that resolves to the introspection response.
   */
  public async introspectToken(accessToken: string): Promise<any> {
    const tokenUrl = `${this.baseUrl}/realms/${this.realm}/protocol/openid-connect/token/introspect`

    const params = new URLSearchParams()
    params.append("client_id", this.clientId)
    params.append("client_secret", this.clientSecret)
    params.append("token", accessToken)

    return await this.sendRequest(tokenUrl, "POST", params)
  }

  /**
   * Decodes a JWT token and returns its payload.
   *
   * @param token - The JWT token to decode.
   *
   * @returns The decoded token payload.
   *
   * @throws Error if the token format is invalid or if decoding fails.
   */
  public decodeToken(token: string): any {
    const parts = token.split(".")
    if (parts.length !== 3) {
      throw new KeycloakError("Invalid token format")
    }
    const payloadBase64 = parts[1]
    const payloadJson = Buffer.from(payloadBase64, "base64").toString("utf-8")
    try {
      return JSON.parse(payloadJson)
    } catch {
      throw new KeycloakError("Failed to decode token payload")
    }
  }

  /**
   * Validates and decodes a user accessToken.
   * Uses the introspection endpoint to validate the accessToken. If the accessToken is inactive,
   * an error is thrown. If active, uses the decodeToken method to return the decoded payload.
   *
   * @param accessToken - The JWT accessToken to validate and decode.
   * @returns The decoded accessToken payload.
   * @throws Error if the accessToken is inactive or in an invalid format.
   */
  public async validateUser(accessToken: string): Promise<any> {
    const introspection = await this.introspectToken(accessToken)
    if (!introspection.active) {
      throw new KeycloakError("AccessToken is inactive")
    }
    return this.decodeToken(accessToken)
  }

  /**
   * Creates a new realm role in Keycloak.
   *
   * @param roleName - The name of the role to create.
   * @param description - Optional description for the role.
   */
  public async createRealmRole(roleName: string, description?: string): Promise<void> {
    const adminToken = await this.getAccessToken()
    const url = `${this.baseUrl}/admin/realms/${this.realm}/roles`

    await this.sendRequest(
      url,
      "POST",
      { name: roleName, description: description || "" },
      { Authorization: `Bearer ${adminToken}` },
    )
  }

  /**
   * Retrieves a realm role by its name.
   *
   * @param roleName - The name of the role.
   * @returns The role object returned by Keycloak, or undefined if not found.
   */
  public async getRealmRole(roleName: string): Promise<any | undefined> {
    const adminToken = await this.getAccessToken()
    const url = `${this.baseUrl}/admin/realms/${this.realm}/roles/${encodeURIComponent(roleName)}`

    try {
      return await this.sendRequest(url, "GET", undefined, { Authorization: `Bearer ${adminToken}` })
    } catch (error: any) {
      if (error.message.includes("404")) {
        return undefined
      }
      throw new Error(`Failed to get role "${roleName}": ${error.message}`)
    }
  }

  /**
   * Assigns a realm role to a user.
   *
   * @param userId - The ID of the user.
   * @param roleName - The name of the role to assign.
   */
  public async assignRoleToUser(userId: string, roleName: string): Promise<void> {
    const adminToken = await this.getAccessToken()
    const role = await this.getRealmRole(roleName)

    if (!role || !role.id) {
      throw new Error(`Role "${roleName}" not found or missing ID.`)
    }

    const url = `${this.baseUrl}/admin/realms/${this.realm}/users/${encodeURIComponent(userId)}/role-mappings/realm`

    await this.sendRequest(url, "POST", [{ id: role.id, name: role.name }], { Authorization: `Bearer ${adminToken}` })
  }

  /**
   * Simulates front-end authentication using user credentials.
   * Uses only the baseUrl and realm from configuration, while the clientId, username, and password are provided by the user.
   *
   * @param username - The user's username.
   * @param password - The user's password.
   * @param clientId - The client ID for authentication.
   * @returns The authentication response data.
   */
  public async frontAuthentication(username: string, password: string, clientId: string): Promise<any> {
    const tokenUrl = `${this.baseUrl}/realms/${this.realm}/protocol/openid-connect/token`
    const params = new URLSearchParams()
    params.append("grant_type", "password")
    params.append("client_id", clientId)
    params.append("username", username)
    params.append("password", password)
    return await this.sendRequest(tokenUrl, "POST", params)
  }
}
