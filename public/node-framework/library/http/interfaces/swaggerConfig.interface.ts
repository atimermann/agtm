/**
 * Interface for Swagger configuration
 * REF: https://swagger.io/specification/#schema-1
 *
 * Se precisar mais configuração ir adicionando
 */
export interface SwaggerConfig {
  enabled: boolean
  routePrefix: string
  theme?: {
    title?: string
  }
  uiConfig?: {
    docExpansion?: string
    deepLinking?: boolean
  }
  openapi: {
    openapi: string

    info: {
      title: string
      summary?: string
      description?: string
      termsOfService?: string

      contact?: {
        name?: string
        url?: string
        email?: string
      }

      license?: {
        name: string
        identifier?: string
        url?: string
      }

      version: string
    }
    externalDocs?: {
      description?: string
      url: string
    }
  }
}
