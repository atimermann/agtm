/**
 * Interface for Swagger configuration
 * REF: https://swagger.io/specification/#schema-1
 *
 * Se precisar mais configuração ir adicionando
 */
import type { OpenAPIObject, PathObject } from "openapi3-ts/oas30"

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
  openapi: Omit<OpenAPIObject, "paths"> & { paths?: PathObject }
}
