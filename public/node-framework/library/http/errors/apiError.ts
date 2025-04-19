import type { FastifyReply } from "fastify"
import type { RFC7807Error } from "#/http/interfaces/RFC7807Error.js"

/**
 * Created on 15/03/2025
 *
 * @author André Timermann <andre@timermann.com.br>
 *
 * @file
 * Represents an API error with a title, status, and message (detail).
 *
 * RFC 7807 details: https://tools.ietf.org/html/rfc7807
 *
 */
export class ApiError extends Error implements RFC7807Error {
  constructor(
    readonly message: string,
    readonly title = "Internal Server Error",
    readonly status = 500,
    readonly restricted = "",
  ) {
    super(message)
    this.name = "ApiError"
  }

  setResponse(reply: FastifyReply) {
    const detail =
      process.env.NODE_ENV === "development" || process.env.NODE_ENV === "homologation"
        ? `${this.message}${this.restricted ? ` - ${this.restricted}` : ""}`
        : this.message

    reply.status(this.status).send({
      type: "about:blank",
      title: this.title,
      status: this.status,
      detail,
    })
  }
}
