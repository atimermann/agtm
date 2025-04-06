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
import type { FieldSchemaInterface } from "./fieldsSchema.interface.ts"
import type { UiSchemaInterface } from "./uiSchema.interface.ts"
import type { DocsSchemaInterface } from "./docsSchema.interface.ts"
import type { AuthSchemaInterface } from "#/http/interfaces/schemas/autoSchema/authSchema.interface.js"

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
   *  - Será uma instancia de ApiAuto
   *  - Se não definido:
   *    - Busca no App atual se tá definido para o modulo atual ex: tenant.auto.ts no caso de tenant
   *    - Carrega o "ApiAuto" padrão em library/http/apiAuto.ts
   *  - Deve ter prefixo auto.ts para identificação automática
   *  - Se auto = 'account' o arquivo deverá se chamar 'account.auto.ts' dentro do App atual
   *  - Para carregar de outro App definir auto = "[Nome do App]:[Nome do modulo].auto.ts
   *    - Por exemplo: Account:account
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
