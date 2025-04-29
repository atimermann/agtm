/**
 * **Created on 27/04/2025**
 *
 * ValidatorByInterface
 * @author André Timermann <andre@timermann.com.br>
 *
 * @file
 *  Valida objetos baseados em interfaces TypeScript, oferecendo suporte para caminhos absolutos
 *  ou relativos ao diretório de trabalho atual.
 *
 * @see https://github.com/vega/ts-json-schema-generator
 *
 * @note
 *  - Esta classe deve ser instanciada uma única vez por questões de performance,
 *    já que compila um validador que pode ser utilizado em vários locais.
 *
 */

import Ajv from "ajv"
import { existsSync } from "node:fs"
import { resolve, isAbsolute, dirname, join } from "node:path"
import * as tsj from "ts-json-schema-generator"
import type { Config } from "ts-json-schema-generator"
import type { LoggerInterface } from "#/loggers/logger.interface.js"
import { fileURLToPath } from "node:url"

// Obtém o diretório atual do arquivo de teste
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const LIBRARY_DIR = join(__dirname, "..")
const ROOT_DIR = join(LIBRARY_DIR, "..")

/**
 * Interface para abstração do validador de schema
 */
interface SchemaValidator {
  validate(data: unknown): boolean
  errors?: Array<{
    instancePath: string
    schemaPath: string
    keyword: string
    message?: string
    params: Record<string, unknown>
  }>
  validator: any
}

/**
 * Validador de objetos baseado em interfaces TypeScript
 */
export class ValidatorByInterface {
  private readonly validator: SchemaValidator
  private readonly interfaceName: string
  private readonly interfacePath: string

  /**
   * Cria um novo validador baseado em uma interface TypeScript
   *
   * @param interfacePath Caminho da interface (absoluto ou relativo ao diretório de trabalho atual)
   * @param typeName Nome do tipo/interface a ser validado
   * @param tsconfigPath Caminho para o arquivo tsconfig.json (opcional, default: 'tsconfig.json' no diretório atual)
   */
  constructor(interfacePath: string, typeName: string, tsconfigPath?: string) {
    // Normaliza o caminho da interface (absoluto ou relativo ao CWD)
    const resolvedPath = this.resolvePath(interfacePath)

    this.interfacePath = resolvedPath
    this.interfaceName = typeName

    // Verifica se o arquivo existe
    this.validateFileExists(resolvedPath)

    // Configura o gerador de schema
    const tsConfigPath = tsconfigPath || resolve(ROOT_DIR, "tsconfig.json")
    const schema = this.createAvjSchema(resolvedPath, tsConfigPath, typeName)

    // Compila o validador
    this.validator = this.compileValidator(schema)
  }

  /**
   * Valida um objeto contra o schema gerado da interface TypeScript
   *
   * @template T Tipo esperado do objeto validado
   * @param data Objeto a ser validado
   * @param logger Instância de logger opcional para registrar erros
   *
   * @returns O objeto validado
   * @throws TypeError se o objeto não for válido segundo o schema
   */
  validate<T>(data: T, logger?: LoggerInterface): T {
    const isValid = this.validator.validate(data)

    if (isValid) {
      return data
    }

    if (logger) {
      this.logValidationErrors(logger)
    }

    throw new TypeError(`Objeto inválido para interface "${this.interfaceName}"`, {
      cause: this.validator.errors,
    })
  }

  /**
   * Resolve o caminho da interface, suportando caminhos absolutos ou relativos ao CWD
   */
  private resolvePath(interfacePath: string): string {
    if (interfacePath.startsWith("#/")) {
      // Remove o prefixo "#/" e resolve para a pasta library
      const pathWithoutPrefix = interfacePath.substring(2)
      return resolve(LIBRARY_DIR, pathWithoutPrefix)
    }

    return isAbsolute(interfacePath) ? interfacePath : resolve(process.cwd(), interfacePath)
  }

  /**
   * Verifica se o arquivo da interface existe
   */
  private validateFileExists(filePath: string): void {
    if (!existsSync(filePath)) {
      throw new Error(`Interface file not found: ${filePath}`)
    }
  }

  /**
   * Cria o schema JSON a partir da interface TypeScript
   */
  private createAvjSchema(interfacePath: string, tsConfigPath: string, typeName: string): tsj.Schema {
    const config: Config = {
      path: interfacePath,
      tsconfig: tsConfigPath,
      type: typeName,
    }

    const generator = tsj.createGenerator(config)
    return generator.createSchema(config.type)
  }

  /**
   * Compila o validador a partir do schema
   */
  private compileValidator(schema: tsj.Schema): SchemaValidator {
    // @ts-expect-error TS2351: This expression is not constructable. (porém é)
    const ajv = new Ajv({ useDefaults: true })
    const compiledValidator = ajv.compile(schema)

    return {
      validate: (data: unknown): boolean => compiledValidator(data),
      get errors() {
        return compiledValidator.errors
      },
      validator: compiledValidator,
    }
  }

  /**
   * Registra erros de validação no logger, se fornecido
   */
  private logValidationErrors(logger: LoggerInterface): void {
    const errorMessages: string[] = [
      "----------------------------------- INÍCIO DOS ERROS DE VALIDAÇÃO --------------------------------",
      `Falha na validação para interface "${this.interfaceName}":`,
      `Caminho: "${this.interfacePath}":`,
      "Erros:",
    ]

    for (const error of this.validator.errors || []) {
      errorMessages.push(
        "-------------------------------------------",
        `Caminho da Instância: ${error.instancePath || "(raiz)"}`,
        `Caminho do Schema:    ${error.schemaPath}`,
        `Palavra-chave:        ${error.keyword}`,
        `Mensagem:             ${error.message || ""}`,
        `Parâmetros:\n${JSON.stringify(error.params, null, 2)}`,
      )
    }

    errorMessages.push("--------------------------------- FIM DOS ERROS ---------------------------------------------")

    logger.error("\n" + errorMessages.join("\n"))
  }
}
