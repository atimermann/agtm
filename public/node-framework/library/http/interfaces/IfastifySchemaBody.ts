/**
 * Created on 16/03/2025
 *
 * @author
 *   André Timermann <andre@timermann.com.br>
 *
 * @file
 *    Representa o schema definir os campos Body do FastifySchema, na documentação está como unknown portanto vamos
 *    definir aqui
 *
 * TODO: Se encontrar a definição deste schema no fastify remover esta interface e substituir
 */


export interface IFastifySchemaBody {
  type: "object"
  required: string[]
  properties: Record<string, { type: string; default: unknown; minLength?: number }>
  additionalProperties: boolean
}
