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
  https://auth.crontech.com.br/realms/crontech/.well-known/openid-configuration
*/

const KEYCLOAK_CONFIG = {
  BASE_URL: "https://auth.crontech.com.br",
  REALM: "crontech",
  CLIENT_ID: "crontech-platform-server",
  CLIENT_SECRET: "vscE7QT8UaDeARP7gvEVZ4ZWXq2F7Kzn",
}

/**
 * Defines the structure for Keycloak configuration.
 */
export interface KeycloakConfig {
  baseUrl: string
  realm: string
  clientId: string
  clientSecret: string
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
   * Retrieves an admin access token from Keycloak using the client credentials grant.
   * @returns {Promise<string>} A promise that resolves to the admin access token.
   */
  public async getAdminToken(): Promise<string> {
    const tokenUrl = `${this.baseUrl}/realms/${this.realm}/protocol/openid-connect/token`

    console.log(`Conectando à ${tokenUrl}...`)

    const params = new URLSearchParams()
    params.append("grant_type", "client_credentials")
    params.append("client_id", this.clientId)
    params.append("client_secret", this.clientSecret)

    const response = await fetch(tokenUrl, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: params,
    })

    if (!response.ok) {
      throw new Error(`Failed to obtain admin token: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    return data.access_token as string
  }

  /**
   * Creates a new realm role in Keycloak.
   * @param roleName - The name of the role to create.
   * @param description - Optional description for the role.
   */
  public async createRealmRole(roleName: string, description?: string): Promise<void> {
    const adminToken = await this.getAdminToken()
    const url = `${this.baseUrl}/admin/realms/${this.realm}/roles`

    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${adminToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: roleName,
        description: description || "",
      }),
    })

    if (!response.ok) {
      throw new Error(
        `Failed to create role "${roleName}": ${response.status} ${response.statusText}`,
      )
    }
  }

  /**
   * Retrieves a realm role by its name.
   * @param roleName - The name of the role.
   * @returns The role object returned by Keycloak, or undefined if not found.
   */
  public async getRealmRole(roleName: string): Promise<any | undefined> {
    const adminToken = await this.getAdminToken()
    const url = `${this.baseUrl}/admin/realms/${this.realm}/roles/${encodeURIComponent(roleName)}`

    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${adminToken}` },
    })

    if (response.status === 404) {
      return undefined
    }

    if (!response.ok) {
      throw new Error(`Failed to get role "${roleName}": ${response.status} ${response.statusText}`)
    }

    return response.json()
  }

  /**
   * Assigns a realm role to a user.
   * @param userId - The ID of the user.
   * @param roleName - The name of the role to assign.
   */
  public async assignRoleToUser(userId: string, roleName: string): Promise<void> {
    const adminToken = await this.getAdminToken()
    const role = await this.getRealmRole(roleName)

    if (!role || !role.id) {
      throw new Error(`Role "${roleName}" not found or missing ID.`)
    }

    const url = `${this.baseUrl}/admin/realms/${this.realm}/users/${encodeURIComponent(userId)}/role-mappings/realm`

    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${adminToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify([{ id: role.id, name: role.name }]),
    })

    if (!response.ok) {
      throw new Error(
        `Failed to assign role "${roleName}" to user ${userId}: ${response.status} ${response.statusText}`,
      )
    }
  }
}
