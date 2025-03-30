/**
 * Created on 18/02/2025
 *
 * @author André Timermann <andre@timermann.com.br>
 *
 * @file
 * Descreve atributos que serão utilizados na geração automática na UI (Interface de usuário no frontEnd) no campo
 *
 */

export interface UiFieldSchemaInterface {
  /**
   * Label do input
   */
  label?: string
  /**
   * Diferente do default que define o valor que será persistido pela API ou pela base de dados, initial define o valor
   * inicial sugerido para o usuário. Normalmente utilizado no front comandos
   * No front initial tem prioridade, porém se não definido poderá usar o default.
   * Dica: Usar initial como null para não sugerir mesmo com default
   */
  initial?: unknown
}
