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
import type { LoggerInterface } from "#/loggers/logger.interface.js"

/**
 * ErrorHandlerService class that provides methods to handle errors and send responses in the RFC 7807 format.
 */
export default class ErrorHandlerService {
  private logger: LoggerInterface

  constructor(logger: LoggerInterface) {
    this.logger = logger
  }

  /**
   * Handles errors and sends an RFC 7807 formatted error response.
   *
   * For validation errors, it groups errors by field to allow the client to display messages next to the appropriate form fields.
   *
   * @param {Error & { validation?: any[] }} error - The error object, possibly with a "validation" array from AJV.
   * @param {FastifyRequest} request - The Fastify request object.
   * @param {FastifyReply} reply - The Fastify reply object.
   */
  public handleError(
    error: Error & { validation?: any[] },
    request: FastifyRequest,
    reply: FastifyReply,
  ): void {
    if (!error.validation) {
      reply.status(500).send({
        type: "about:blank",
        title: "Internal Server Error",
        status: 500,
        detail: error.message || "An unexpected error occurred.",
      })
      return
    }

    reply.status(400).send({
      type: "about:blank",
      title: "Validation Error",
      status: 400,
      detail: "One or more fields have errors.",
      errors: this.getErrorsByField(error.validation),
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
      const field = err.instancePath
        ? err.instancePath.replace(".", "")
        : err.params.missingProperty

      if (!errorsByField[field]) {
        errorsByField[field] = []
      }

      errorsByField[field].push(err.message)
    }

    return errorsByField
  }
}
