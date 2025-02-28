/**
 * Created on 18/02/2025
 *
 * @author André Timermann <andre@timermann.com.br>
 *
 * @file
 * Descreve atributos que serão utilizados na geração automática na UI (Interface de usuário no frontEnd)
 *
 */

export interface UiSchemaInterface {
  /**
   * Botão de criação no CRUD
   */
  createButton?: {
    label: string
  }
  /**
   * Atributos utilizado no formulário
   */
  form?: {
    /**
     * Título de criação
     */
    createTitle: string
    /**
     * Titulo em edição
     */
    updateTitle: string
  }
}
