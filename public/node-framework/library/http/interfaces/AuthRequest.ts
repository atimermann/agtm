import type { FastifyRequest } from "fastify"

/**
 * Representa o payload do token retornado pelo Keycloak.
 */
export interface IKeycloakTokenPayload {
  exp: number
  iat: number
  jti: string
  iss: string
  aud: string
  sub: string
  typ: string
  azp: string
  session_state: string
  acr: string
  "allowed-origins": string[]
  realm_access: {
    roles: string[]
  }
  resource_access: {
    account: {
      roles: string[]
    }
    [key: string]: any
  }
  scope: string
  sid: string
  email_verified: boolean
  name: string
  preferred_username: string
  given_name: string
  family_name: string
  email: string
  // Outros campos que possam ser retornados pelo Keycloak
  [key: string]: any
}

/**
 * Estende o FastifyRequest para incluir dados de autenticação via Keycloak.
 */
export interface AuthRequest extends FastifyRequest {
  /**
   * Dados do token do Keycloak.
   */
  auth?: IKeycloakTokenPayload

  /**
   * Caso seja necessário, pode-se extrair ou adicionar roles diretamente aqui.
   * Normalmente, os papéis podem ser acessados via auth.realm_access.roles.
   */
  roles?: string[]
}
