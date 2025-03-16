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
  public title: string
  public status: number

  constructor(message: string, title: string = "Internal Server Error", status: number = 500) {
    super(message)
    this.title = title
    this.status = status
    this.name = "ApiError"
  }

  setResponse(reply: FastifyReply) {
    reply.status(this.status).send({
      type: "about:blank",
      title: this.title,
      status: this.status,
      detail: this.message,
    })
  }
}
