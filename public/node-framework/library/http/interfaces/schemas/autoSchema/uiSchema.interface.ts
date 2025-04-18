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
   * Título amigável para ser exibido ao usuário
   */
  title?: string

  /**
   * Botão de criação no CRUD
   * @default "Criar novo"
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
     * @default "Criar"
     */
    createTitle: string
    /**
     * Titulo em edição
     * @default "Editar"
     */
    updateTitle: string
  }
}
