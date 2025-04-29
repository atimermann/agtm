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
  console.log('Setup...')
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
  console.log('\nTeardown!')
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


})
