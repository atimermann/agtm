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

export default class ValidatorByInterface {
  private ajv
  private readonly schema: tsj.Schema
  private readonly schemaValidator: any
  private interfaceName: string

  /**
   * Cria um validator à partir de uma interface TypeScript.
   *
   * Gera um **JSON Schema** em tempo de execução para validar objetos dinamicamente.
   *
   * @param interfacePath Caminho da interface **relativo à raiz do `node-framework`**.
   *                      Exemplo: `library/httpV2/interfaces/autoSchema/autoSchema.interface.ts`
   *
   * @param typeName  Tipo da interface para ser gerado validator (ou nome da interface)
   *
   * @throws {Error} Se o arquivo da interface não for encontrado.
   */
  constructor(interfacePath: string, typeName: string) {
    const interfaceResolvedPath = resolve(__dirname, ROOT_RELATIVE_PATH, interfacePath)

    if (!existsSync(interfaceResolvedPath)) {
      throw new Error(`Interface file not found: ${interfaceResolvedPath}`)
    }

    // @ts-ignore
    this.ajv = new Ajv()

    /** @type {import('ts-json-schema-generator/src/Config').Config} */
    const generatorSchemaConfig = {
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
   * @returns `true` se o objeto for válido, caso contrário lança um erro com detalhes.
   *
   * @throws {TypeError} Se o objeto não for válido de acordo com o JSON Schema gerado.
   */
  validate(objectToValidate: any): boolean {
    if (this.schemaValidator(objectToValidate)) {
      return true
    }

    throw new TypeError(`Invalid object for interface "${this.interfaceName}"`, {
      cause: this.schemaValidator.errors,
    })
  }

  private generateAjvSchemaByInterfaceCode(generatorConfig) {
    return tsj.createGenerator(generatorConfig).createSchema(generatorConfig.type)
  }
}
