/**
 * **Created on 27/04/2025**
 *
 * SchemaGenerator Interface
 * @author André Timermann <andre@timermann.com.br>
 *
 * @file
 *  Define o contrato para geradores de schema JSON a partir de interfaces TypeScript
 */

import type { Config, Schema } from "ts-json-schema-generator"

/**
 * Interface para gerador de schema
 *
 * Define o contrato para classes que geram schemas JSON a partir de interfaces TypeScript.
 * Diferentes implementações podem usar estratégias variadas para gerar o schema,
 * como análise estática, reflexão em tempo de execução, ou anotações personalizadas.
 */
export interface SchemaGeneratorInterface {
  /**
   * Gera um schema JSON a partir de uma configuração
   *
   * @param config - Configuração para geração do schema, contendo informações como
   *                 caminho do arquivo, configuração do TypeScript e nome do tipo
   * @returns Schema JSON gerado que pode ser usado para validação
   */
  generateSchema(config: Config): Schema
}
