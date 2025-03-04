/**
 * Created on 18/02/2025
 *
 * @author André Timermann <andre@timermann.com.br>
 *
 * @file
 * Informação para geração de documentação OpenApI (Swagger)
 *
 * Baseado na especificação do OpenAPI para https://swagger.io/specification/#operation-object
 *
 */

/**
 * Interface para a documentação da API gerada automaticamente.
 */
export interface DocsSchemaInterface {

  /**
   * Nome do recurso
   * No Swagger será criado uma tag com este recurso
   * Se não definido será usado model
   */
  name?: string

  /**
   * Descrição detalhada da API gerada.
   */
  description: string

}
