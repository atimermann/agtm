import type { FastifyReply } from "fastify"
import { RFC7807ErrorInterface } from "#/http/interfaces/RFC7807ErrorInterface.js"

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
export class ApiError extends Error implements RFC7807ErrorInterface {
  constructor(
    readonly message: string,
    readonly title: string = "Internal Server Error",
    readonly status: number = 500,
    readonly restricted: string = "",
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
