/**
 * Created on 18/02/2025
 *
 * @author André Timermann <andre@timermann.com.br>
 *
 * @file
 * Descreve o schema de geração de API Automático
 *
 * Arquivo Principal
 *
 */
import { FieldSchemaInterface } from "./fieldsSchema.interface.ts"
import { UiSchemaInterface } from "./uiSchema.interface.ts"
import { DocsSchemaInterface } from "./docsSchema.interface.ts"
import { AuthSchemaInterface } from "#/http/interfaces/schemas/autoSchema/authSchema.interface.js"

export interface AutoSchemaInterface {

  /**
   * Se definido não ignora campos adicinais
   * Padrão: true
   */
  strict?: boolean

  /**
   * Nome do modelo ou tabela do banco de dados
   */
  model: string

  /**
   * Nome do gerador de query automático:
   *  - Será uma instancia de AutoApi
   *  - Se não definido irá utilizar o AutoApi padrão definido em library/http/autoApi.ts
   *  - No projeto do usuário deverá ter o prefixo auto.ts
   *  - Se auto = 'account' o arquivo deverá se chamar 'account.auto.ts'
   */
  auto?: string

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
   * Define a configuração de autenticação para a API.
   *  1. Habilita ou desabilita autorização para todas as operações da API
   *  2. Habilita e define permissões (roles) para todas as operações da API
   *  3. Configuração individual para cada operação da API
   */
  auth?: boolean | string[] | AuthSchemaInterface

  /**
   * Lista de campos do  modelo
   */
  fields: FieldSchemaInterface[]
  /**
   * Configuração da interface de usuário do crud gerado para esta API (FrontEnd)
   */
  ui?: UiSchemaInterface
}
