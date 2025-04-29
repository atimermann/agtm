/**
 * **Created on 27/04/2025**
 *
 * ValidatorByInterfaceTest
 * @author André Timermann <andre@timermann.com.br>
 *
 * @file
 *  Teste unitário para ValidatorByInterface usando Node.js Test Runner
 *
 */

import { test, describe, before, after } from "node:test"
import assert from "node:assert/strict"
import { mkdir, writeFile, rm } from "node:fs/promises"
import { existsSync } from "node:fs"
import { dirname, join, resolve } from "node:path"
import { fileURLToPath } from "node:url"
import process from "node:process"

// Testar importação do index para simular importação de "@agtm/node-framework"
import { ValidatorByInterface } from "../../index.ts"
import type { LoggerInterface } from "../../index.ts"

// Obtém o diretório atual do arquivo de teste
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Diretório temporário para os arquivos de teste
const TEST_DIR = join(__dirname, "fixtures", "validator-interface")
const INTERFACE_FILE = join(TEST_DIR, "test-interface.ts")
const TSCONFIG_FILE = join(TEST_DIR, "tsconfig.json")

// Armazena o diretório de trabalho original
const originalCwd = process.cwd()

// =====================================================================================================================
// MOCKS

// Mock de logger para testar a funcionalidade de log
class MockLogger implements LoggerInterface {
  public logs: string[] = []

  info(message: string): void {
    this.logs.push(message)
  }
  debug(message: string): void {
    this.logs.push(message)
  }
  warn(message: string): void {
    this.logs.push(message)
  }
  error(message: string): void {
    this.logs.push(message)
  }
}

// =====================================================================================================================
// SETUP
async function setup() {
  console.log("Setup...")
  // Cria diretório temporário se não existir
  if (!existsSync(TEST_DIR)) {
    await mkdir(TEST_DIR, { recursive: true })
  }

  // Cria arquivo de interface para teste
  const interfaceContent = `
  /**
   * Interface de teste para validação
   */
  export interface TestUser {
    id: number
    name: string
    email: string
    age?: number
    active: boolean
  }

  /**
   * Interface de teste com valores padrão
   */
  export interface TestUserWithDefaults {
    id: number
    /** @default "Usuário Padrão" */
    name: string
    /** @default "usuario@exemplo.com" */
    email: string
    /** @default 25 */
    age?: number
    /** @default true */
    active: boolean
  }
  `
  await writeFile(INTERFACE_FILE, interfaceContent, "utf8")

  // Cria tsconfig.json básico para teste
  const tsconfigContent = `{
    "compilerOptions": {
      "target": "ES2022",
      "module": "NodeNext",
      "moduleResolution": "NodeNext",
      "esModuleInterop": true,
      "strict": true
    }
  }`
  await writeFile(TSCONFIG_FILE, tsconfigContent, "utf8")
}

// =====================================================================================================================
// TEARDOWN
async function teardown() {
  // Remove diretório de teste recursivamente
  await rm(TEST_DIR, { recursive: true, force: true })
  console.log("\nTeardown!")
}

// =====================================================================================================================
// Tests

/**
 * Função para logar o progresso do teste atual
 */
function logTestProgress() {
  process.stdout.write(".")
}

describe("ValidatorByInterface", async () => {
  // Validador padrão que será usado na maioria dos testes
  let defaultValidator: ValidatorByInterface

  // Setup e Teardown para todos os testes
  before(async () => {
    await setup()
    // Inicializa o validador padrão uma única vez
    defaultValidator = new ValidatorByInterface(INTERFACE_FILE, "TestUser", TSCONFIG_FILE)
  })

  after(async () => {
    await teardown()
  })

  /**
   * Verifica se o validador consegue validar corretamente um objeto que
   * atende aos requisitos da interface TestUser.
   */
  await test("Deve validar um objeto válido corretamente", () => {
    logTestProgress()

    // Arrange
    const validUser = {
      id: 1,
      name: "João Silva",
      email: "joao@exemplo.com",
      active: true,
    }

    // Act & Assert
    // Não deve lançar exceção
    const result = defaultValidator.validate(validUser)
    assert.deepStrictEqual(result, validUser)
  })

  /**
   * Verifica se o validador rejeita corretamente um objeto quando
   * faltam propriedades obrigatórias definidas na interface TestUser.
   */
  await test("deve rejeitar um objeto inválido e lançar TypeError", () => {
    logTestProgress()

    // Arrange
    const invalidUser = {
      id: 1,
      name: "Maria Souza",
      // falta o campo email que é obrigatório
      active: false,
    }

    // Act & Assert
    assert.throws(
      () => defaultValidator.validate(invalidUser),
      (err) => err instanceof TypeError && err.message.includes("TestUser"),
    )
  })

  /**
   * Verifica se o validador lança um erro apropriado quando o caminho
   * do arquivo de interface não existe no sistema de arquivos.
   */
  await test("deve lançar erro para caminho de arquivo inexistente", () => {
    logTestProgress()

    // Arrange
    const nonExistentPath = join(TEST_DIR, "non-existent-file.ts")

    // Act & Assert
    assert.throws(
      () => new ValidatorByInterface(nonExistentPath, "TestUser", TSCONFIG_FILE),
      (err) => err instanceof Error && err.message.includes("Interface file not found"),
    )
  })

  /**
   * Verifica se o validador aceita corretamente caminhos absolutos
   * para localizar o arquivo de interface.
   */
  await test("deve aceitar caminho absoluto", () => {
    logTestProgress()

    // Arrange
    const absolutePath = resolve(INTERFACE_FILE)

    // Act & Assert (não deve lançar erro)
    new ValidatorByInterface(absolutePath, "TestUser", TSCONFIG_FILE)
    assert.ok(true)
  })

  /**
   * Verifica se o validador aceita corretamente caminhos relacionado a raiz do node-framework #/
   */
  await test("deve aceitar caminho relativo ao library do framework: #/", () => {
    logTestProgress()

    const frameworkPath = "#/http/interfaces/SwaggerConfig.ts"

    // Act & Assert (não deve lançar erro)
    new ValidatorByInterface(frameworkPath, "SwaggerConfig", TSCONFIG_FILE)
    assert.ok(true)
  })

  /**
   * Verifica se o validador aplica valores padrão definidos com annotations na interface
   * e os retorna no objeto validado.
   */
  await test("deve aplicar valores padrão definidos na interface via annotations", () => {
    logTestProgress()

    // Arrange
    const validator = new ValidatorByInterface(INTERFACE_FILE, "TestUserWithDefaults", TSCONFIG_FILE)

    const incompleteUser = {
      id: 100, // apenas o id é fornecido, demais campos devem usar valor padrão
    }

    const expectedUser = {
      id: 100,
      name: "Usuário Padrão",
      email: "usuario@exemplo.com",
      age: 25,
      active: true,
    }

    // Act
    const result = validator.validate(incompleteUser)

    // Assert
    assert.deepStrictEqual(result, expectedUser, "Deve incluir valores padrão no objeto validado")
  })

  /**
   * Verifica se o validador aceita caminhos relativos ao diretório atual
   * para localizar o arquivo de interface, alterando temporariamente
   * o diretório de trabalho atual.
   */
  await test("deve aceitar caminho relativo ao diretório atual", async () => {
    logTestProgress()

    // Arrange

    try {
      // Muda para o diretório pai do arquivo de teste
      process.chdir(__dirname)

      // Caminho relativo
      const relativePath = `fixtures/validator-interface/test-interface.ts`

      // Act & Assert (não deve lançar erro)
      new ValidatorByInterface(relativePath, "TestUser", TSCONFIG_FILE)
      assert.ok(true)
    } finally {
      // Restaura o diretório de trabalho original
      process.chdir(originalCwd)
    }
  })

  /**
   * Verifica se o validador registra corretamente as mensagens de erro
   * no objeto logger quando fornecido e um objeto inválido é validado.
   */
  await test("deve registrar erros no logger quando fornecido", () => {
    logTestProgress()

    // Arrange
    const invalidUser = {
      id: "não-é-número", // tipo incorreto
      active: false,
    }

    const mockLogger = new MockLogger()

    // Act & Assert
    assert.throws(() => defaultValidator.validate(invalidUser, mockLogger), TypeError)

    // Verifica se o logger recebeu mensagens
    assert.ok(mockLogger.logs.length > 0)
    assert.ok(mockLogger.logs[0].includes("INÍCIO DOS ERROS DE VALIDAÇÃO"))
  })

  /**
   * Verifica se o erro de validação contém a propriedade cause quando falta um campo obrigatório
   */
  await test("deve incluir detalhes sobre campos obrigatórios no cause", () => {
    logTestProgress()

    // Arrange - Objeto sem um campo obrigatório
    const invalidUserMissingRequired = {
      id: 1,
      name: "Carlos Santos",
      // email está faltando (obrigatório)
      active: true,
    }

    // Act & Assert
    try {
      defaultValidator.validate(invalidUserMissingRequired)
      assert.fail("A validação deveria ter falhado, mas passou")
    } catch (error) {
      // Verificações básicas
      assert.ok(error instanceof TypeError)
      assert.ok("cause" in error)
      assert.ok(Array.isArray(error.cause))

      // Verifica o tipo específico de erro (campo obrigatório faltando)
      const requiredError = error.cause.find(
        (err) => err.keyword === "required" && err.params.missingProperty === "email",
      )

      assert.ok(requiredError, "Deve conter um erro de 'required' para o campo 'email'")
      assert.strictEqual(
        requiredError.params.missingProperty,
        "email",
        "Deve identificar 'email' como a propriedade faltante",
      )
      assert.ok(
        requiredError.message.includes("required property 'email'"),
        "A mensagem deve mencionar a propriedade faltante",
      )
    }
  })

  /**
   * Verifica se o erro de validação contém a propriedade cause quando há um tipo incorreto
   */
  await test("deve incluir detalhes específicos de tipo no cause para erro de tipo", () => {
    logTestProgress()

    // Arrange - Objeto com um campo de tipo incorreto
    const invalidUserWithWrongType = {
      id: "1", // string em vez de número
      name: "Pedro Costa",
      email: "pedro@exemplo.com",
      active: true,
    }

    // Act & Assert
    try {
      defaultValidator.validate(invalidUserWithWrongType)
      assert.fail("A validação deveria ter falhado, mas passou")
    } catch (error) {
      // Verificações básicas
      assert.ok(error instanceof TypeError)
      assert.ok("cause" in error)
      assert.ok(Array.isArray(error.cause))

      // Verifica o tipo específico de erro (tipo incorreto)
      const typeError = error.cause.find((err) => err.keyword === "type" && err.instancePath === "/id")

      assert.ok(typeError, "Deve conter um erro de 'type' para o campo 'id'")
      assert.strictEqual(typeError.params.type, "number", "Deve identificar que esperava um 'number'")
      assert.ok(typeError.message.includes("number"), "A mensagem deve mencionar o tipo esperado")
    }
  })

  /**
   * Verifica se o erro de validação contém a propriedade cause com os detalhes dos erros
   */
  await test("deve incluir a propriedade cause com detalhes no erro de validação", () => {
    logTestProgress()

    // Arrange - Objeto com uma propriedade extra que não existe na interface
    const invalidUserWithExtraProp = {
      id: 1,
      name: "Ana Clara",
      email: "ana@exemplo.com",
      active: true,
      xxx: "propriedade_adicional", // propriedade extra que não existe na interface
    }

    // Act & Assert
    try {
      defaultValidator.validate(invalidUserWithExtraProp)
      assert.fail("A validação deveria ter falhado, mas passou")
    } catch (error) {
      // Verifica se é um TypeError
      assert.ok(error instanceof TypeError, "O erro deve ser uma instância de TypeError")

      // Verifica se a mensagem de erro contém o nome da interface
      assert.ok(error.message.includes("TestUser"), "A mensagem de erro deve incluir o nome da interface")

      // Verifica se existe a propriedade cause
      assert.ok("cause" in error, "O erro deve conter a propriedade 'cause'")

      // Verifica se cause é um array
      assert.ok(Array.isArray(error.cause), "A propriedade 'cause' deve ser um array")

      // Verifica se pelo menos um erro foi relatado
      assert.ok(error.cause.length > 0, "O array 'cause' deve conter pelo menos um erro")

      // Verifica o tipo específico de erro (propriedade adicional)
      const additionalPropError = error.cause.find((err) => err.keyword === "additionalProperties")

      assert.ok(additionalPropError, "Deve conter um erro de 'additionalProperties'")
      assert.strictEqual(
        additionalPropError.params.additionalProperty,
        "xxx",
        "Deve identificar 'xxx' como a propriedade adicional",
      )

      // Verifica a estrutura completa do primeiro erro
      const firstError = error.cause[0]
      assert.ok("instancePath" in firstError, "O erro deve conter a propriedade 'instancePath'")
      assert.ok("schemaPath" in firstError, "O erro deve conter a propriedade 'schemaPath'")
      assert.ok("keyword" in firstError, "O erro deve conter a propriedade 'keyword'")
      assert.ok("params" in firstError, "O erro deve conter a propriedade 'params'")
      assert.ok("message" in firstError, "O erro deve conter a propriedade 'message'")
    }
  })
})
