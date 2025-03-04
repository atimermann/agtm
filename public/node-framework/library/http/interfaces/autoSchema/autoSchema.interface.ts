/**
 * Created on 18/02/2025
 *
 * @author André Timermann <andre@timermann.com.br>
 *
 * @file
 * Descreve o schema de geração de API Automatico
 *
 */
import { FieldSchemaInterface } from "./fieldsSchema.interface.ts"
import { UiSchemaInterface } from "./uiSchema.interface.ts"
import { DocsSchemaInterface } from "./docsSchema.interface.ts"

export interface AutoSchemaInterface {
  /**
   * Nome do modelo ou tabela do banco de dados
   */
  model: string
  /**
   * Identificador único do modelo (Chave primária da tabela)
   */
  key: string
  /**
   * Nome da rota base pra gerar a API
   */
  route: string

  /**
   * Informações de documentação da API.
   */
  docs?: DocsSchemaInterface

  /**
   * Lista de campos do  modelo
   */
  fields: FieldSchemaInterface[]
  /**
   * Configuração da interface de usuário do crud gerado para esta API (FrontEnd)
   */
  ui?: UiSchemaInterface
}
