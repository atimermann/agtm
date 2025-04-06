/**
 * Created on 04/03/2025
 *
 * @author
 *   André Timermann <andre@timermann.com.br>
 *
 * @file
 *  Define contrato de implementação de erros usados no http
 *
 * RFC 7807 details: https://tools.ietf.org/html/rfc7807
 */

import type { FastifyReply } from "fastify"

/**
 * Interface that represents an API error following RFC 7807.
 */
export interface RFC7807Error {
  title: string
  status: number
  message: string
  restricted: string
  validation?: any[]
  setResponse(reply: FastifyReply): void
}
