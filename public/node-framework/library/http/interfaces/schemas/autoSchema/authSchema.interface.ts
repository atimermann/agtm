/**
 * Created on 16/03/2025
 *
 * @author
 *   André Timermann <andre@timermann.com.br>
 *
 * @file
 *    Schema de configuração de autenticação e autorização
 *    Define as configurações de autenticação específicas para cada operação da API.
 */
export interface AuthSchemaInterface {
  /**
   * Configuração para listar todos os registros.
   * Pode ser um booleano ou um array de roles permitidas.
   */
  getAll: boolean | string[]

  /**
   * Configuração para obter um único registro.
   * Pode ser um booleano ou um array de roles permitidas.
   */
  get: boolean | string[]

  /**
   * Configuração para criar um registro.
   * Pode ser um booleano ou um array de roles permitidas.
   */
  create: boolean | string[]

  /**
   * Configuração para atualizar um registro.
   * Pode ser um booleano ou um array de roles permitidas.
   */
  update: boolean | string[]

  /**
   * Configuração para deletar um registro.
   * Pode ser um booleano ou um array de roles permitidas.
   */
  delete: boolean | string[]

  /**
   * Configuração para operações relacionadas ao schema.
   * Pode ser um booleano ou um array de roles permitidas.
   */
  schema: boolean | string[]
}
