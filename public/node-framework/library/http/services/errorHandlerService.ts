/**
 * Created on 04/03/2025
 *
 * @author
 *   André Timermann <andre@timermann.com.br>
 *
 * @file
 * ErrorHandlerService implements an error handler following the RFC 7807 - Problem Details for HTTP APIs standard.
 * This service formats error responses so that clients can easily identify the problematic fields and display
 * corresponding error messages in the UI.
 *
 * RFC 7807 details: https://tools.ietf.org/html/rfc7807
 */

import type { FastifyRequest, FastifyReply } from "fastify"
import type { LoggerInterface } from "#/loggers/logger.interface.ts"
import type { RFC7807ErrorInterface } from "#/http/interfaces/RFC7807ErrorInterface.ts"

/**
 * ErrorHandlerService class that provides methods to handle errors and send responses in the RFC 7807 format.
 */
export default class ErrorHandlerService {
  constructor(private readonly logger: LoggerInterface) {}

  /**
   * Handles errors and sends an RFC 7807 formatted error response.
   *
   * For validation errors, it groups errors by field to allow the client to display messages next to the appropriate form fields.
   *
   * If the error is an instance of ApiError, its title, status, and message (as detail) are used.
   *
   * @param {Error & { validation?: any[] }} error - The error object, possibly with a "validation" array from AJV.
   * @param {FastifyRequest} request - The Fastify request object.
   * @param {FastifyReply} reply - The Fastify reply object.
   */
  public handleError(error: RFC7807ErrorInterface | Error, request: FastifyRequest, reply: FastifyReply): void {
    if (this.handleCustomError(error as RFC7807ErrorInterface, reply)) return
    if (this.handleValidationError(error as RFC7807ErrorInterface, reply)) return
    this.handleGenericError(error as Error, reply)
  }

  /**
   * Handles errors for custom API errors (those that implement setResponse).
   *
   * @param error - The API error object.
   * @param reply - The Fastify reply object.
   */
  private handleCustomError(error: RFC7807ErrorInterface, reply: FastifyReply): boolean {
    if (typeof error.setResponse === "function") {
      this.logger.error(`(${error.status}) ${error.title} ${error.message}`)
      error.setResponse(reply)
      return true
    }
    return false
  }

  /**
   * Handles validation errors by grouping field errors and sending a 400 response.
   *
   * @param error - The error object containing a validation property.
   * @param reply - The Fastify reply object.
   */
  private handleValidationError(error: RFC7807ErrorInterface, reply: FastifyReply): boolean {
    if ("validation" in error && error.validation) {
      this.logger.warn(`(400) Validation ${JSON.stringify(error.validation)}`)
      reply.status(400).send({
        type: "about:blank",
        title: "Validation Error",
        status: 400,
        detail: "One or more fields have errors.",
        errors: this.getErrorsByField(error.validation),
      })
      return true
    }
    return false
  }

  /**
   * Handles generic errors by sending a 500 response.
   *
   * @param error - The error object.
   * @param reply - The Fastify reply object.
   */
  private handleGenericError(error: Error, reply: FastifyReply): void {
    // Loga o erro completo para fins de auditoria e debugging.
    this.logger.error(`${error.message}\n${error.stack}`)

    if (process.env.NODE_ENV === "development" || process.env.NODE_ENV === "homologation") {
      reply.status(500).send({
        type: "about:blank",
        title: "Internal Server Error",
        status: 500,
        detail: error.message || "An unexpected error occurred.",
        stack: error.stack?.split("\n"),
      })
      return
    }

    reply.status(500).send({
      type: "about:blank",
      title: "Internal Server Error",
      status: 500,
      detail: "An unexpected error occurred.",
    })
  }

  /**
   * Groups validation errors by field.
   *
   * @param  validationErrors - The array of validation error objects from AJV.
   *
   * @returns An object mapping each field to its error messages.
   */
  private getErrorsByField(validationErrors: any[]): Record<string, string[]> {
    const errorsByField: Record<string, string[]> = {}

    for (const err of validationErrors) {
      // instancePath can be an empty string if the error is at the root level.
      // If empty, try to get the missing property from error params.
      const field = err.instancePath ? err.instancePath.replace(".", "") : err.params.missingProperty

      if (!errorsByField[field]) {
        errorsByField[field] = []
      }

      errorsByField[field].push(err.message)
    }

    return errorsByField
  }
}
