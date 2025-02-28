/**
 * Created on 18/02/2025
 *
 * @author André Timermann <andre@timermann.com.br>
 *
 * @file
 * Descreve o schema de geração de API automática
 *
 */
import { UiFieldSchemaInterface } from "./uiFieldSchema.interface.ts"

export interface FieldSchemaInterface {
  /**
   * Nome final do campo que será visto pelo usuário
   */
  name: string
  /**
   * Nome do campo no modelo (da tabela), padrão: name
   */
  dbName?: string
  /**
   * Tipo de Campo
   * TODO: Enumerar os tipos
   */
  type: string
  /**
   * Se for chave estrangeira, nome da relation definida no Prisma
   */
  relation?: string
  /**
   * Se é um campo único
   */
  unique?: boolean
  /**
   * Se é obrigatório
   */
  required?: boolean
  /**
   * Se permite ser atribuído na criação
   */
  create?: boolean
  /**
  * Se permite ser atribuído na Atualização
  */
  update?: boolean
  /**
   * Se será retornado na api
   */
  view?: boolean
  /**
   * Propriedades de validação usado pelo front
   */
  uiProperties?: UiFieldSchemaInterface
}
