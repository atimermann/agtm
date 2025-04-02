/**
 * Created on 20/02/2025
 *
 * @author André Timermann <andre@timermann.com.br>
 *
 * @file
 * Valida Objeto à partir de uma interface (interface será carregada como se fosse um arquivo)
 *
 * @see https://github.com/vega/ts-json-schema-generator
 *
 * @note
 * - `interfacePath` deve ser um caminho **relativo à raiz do projeto `node-framework`**.
 * - Compatível apenas com interfaces dentro do `node-framework`, não aplicável a projetos externos.
 * - Esta classe deve ser instanciada apenas uma vez por questão de performance, já que compila um validador,
 *    que esse sim pode ser utiliza-do em vários locais, DICA: Instancia fora da classe logo depois dos imports
 *
 */
import Ajv from "ajv"
import { existsSync } from "node:fs"
import { dirname, resolve } from "node:path"
import tsj from "ts-json-schema-generator"
import { fileURLToPath } from "node:url"

import type { Config } from "ts-json-schema-generator"
import type { LoggerInterface } from "#/loggers/logger.interface.js"

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

/**
 * Caminho relativo à raiz do node-framework, alterar se mover este código (interfaceValidaor)
 */
const ROOT_RELATIVE_PATH = "../../"

/**
 * Caminho do tsConfig, usado pelo compilador
 */
const TS_CONFIG_PATH = resolve(__dirname, ROOT_RELATIVE_PATH, "tsconfig.json")

export class ValidatorByInterface {
  private ajv
  private readonly schema: tsj.Schema
  private readonly schemaValidator: any
  private readonly interfaceName: string
  private readonly interfacePath: string

  /**
   * Cria um validator à partir de uma interface TypeScript.
   *
   * Gera um **JSON Schema** em tempo de execução para validar objetos dinamicamente.
   *
   * @param interfacePath Caminho da interface **relativo à raiz do `node-framework`**.
   *                      Exemplo: `library/http/interfaces/schemas/autoSchema/autoSchema.interface.ts`
   *
   * @param typeName  Tipo da interface para ser gerado validator (ou nome da interface)
   *
   * @throws {Error} Se o arquivo da interface não for encontrado.
   */
  constructor(interfacePath: string, typeName: string) {
    const interfaceResolvedPath = resolve(__dirname, ROOT_RELATIVE_PATH, interfacePath)
    this.interfacePath = interfacePath

    if (!existsSync(interfaceResolvedPath)) {
      throw new Error(`Interface file not found: ${interfaceResolvedPath}`)
    }

    // @ts-ignore
    this.ajv = new Ajv()

    const generatorSchemaConfig: Config = {
      path: resolve(interfaceResolvedPath),
      tsconfig: TS_CONFIG_PATH,
      type: typeName,
    }

    this.interfaceName = typeName

    this.schema = this.generateAjvSchemaByInterfaceCode(generatorSchemaConfig)
    this.schemaValidator = this.ajv.compile(this.schema)
  }

  /**
   * Valida um objeto contra o esquema gerado a partir da interface TypeScript.
   *
   * @param objectToValidate Objeto a ser validado.
   * @param logger  Objeto de log
   *
   * @returns `true` se o objeto for válido, caso contrário lança um erro com detalhes.
   *
   * @throws {TypeError} Se o objeto não for válido de acordo com o JSON Schema gerado.
   */
  validate(objectToValidate: any, logger?: LoggerInterface): boolean {
    if (this.schemaValidator(objectToValidate)) {
      return true
    }

    this.logErrors(logger)

    throw new TypeError(`Invalid object for interface "${this.interfaceName}"`, {
      cause: this.schemaValidator.errors,
    })
  }

  /**
   * Imprime erro se objeto de logger for passado em validate
   *
   * @param logger
   */
  logErrors(logger: LoggerInterface | undefined) {
    if (!logger) return

    const errorMessages: string[] = [
      "----------------------------------- START VALIDATOR ERRORS--------------------------------",
      `Validation failed for interface "${this.interfaceName}":`,
      `Path: "${this.interfacePath}":`,
      "Erros:",
    ]

    for (const error of this.schemaValidator.errors ?? []) {
      errorMessages.push(
        `-------------------------------------------`,
        `Instance Path:   ${error.instancePath || "(root)"}`,
        `Schema Path:     ${error.schemaPath}`,
        `Keyword:         ${error.keyword}`,
        `Message:         ${error.message}`,
        `Params:\n${JSON.stringify(error.params, null, 2)}`,
      )
    }

    errorMessages.push(
      "--------------------------------- END ERRORS ---------------------------------------------",
    )

    logger.error("\n" + errorMessages.join("\n"))
  }

  /**
   * Gera um schema no padrão AJV baseado na interface disponibilizada pelo usuário
   *
   * @param generatorConfig
   * @private
   */
  private generateAjvSchemaByInterfaceCode(generatorConfig: Config) {
    return tsj.createGenerator(generatorConfig).createSchema(generatorConfig.type)
  }
}
