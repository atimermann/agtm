# ValidatorByInterface

Um utilitário de validação de tipos em tempo de execução para o Node-framework que valida objetos contra interfaces
TypeScript.

## Visão Geral

O `ValidatorByInterface` permite a validação em tempo de execução de objetos contra interfaces TypeScript, o que é
particularmente útil para validar objetos de configuração ou entrada do usuário.

## Instalação

Esta utilidade está disponível diretamente do pacote Node-framework. Pode ser importada tanto dentro de projetos que usam o framework quanto de forma independente através da exportação no arquivo index.ts principal:

## Uso

### Exemplo Básico

```typescript
import type { LoggerInterface } from "#/loggers/logger.interface.js"
import type { SwaggerConfig } from "#/http/interfaces/swaggerConfig.interface.js"

import Config from "#/config.js"
import { ValidatorByInterface } from "#/utils/validatorByInterface.js"

const swaggerConfigValidator = new ValidatorByInterface("#/http/interfaces/SwaggerConfig.ts", "SwaggerConfig")

export class Exemplo {
  private readonly logger: LoggerInterface
  private readonly config: SwaggerConfig

  constructor(logger: LoggerInterface, config?: SwaggerConfig) {
    this.logger = logger
    this.config = config ?? Config.getYaml("swagger")
    swaggerConfigValidator.validate(this.config, this.logger)
  }
}
```

### Parâmetros do Construtor

1. **interfacePath** (string): Caminho para o arquivo da interface, suportando três formatos:

   - **Caminho absoluto**: Caminho completo do sistema de arquivos (ex: `/home/user/projects/interfaces/Config.ts`)
   - **Caminho relativo**: Relativo ao diretório de trabalho atual (ex: `./interfaces/Config.ts`)
   - **Caminho com prefixo "#/"**: Relativo à raiz da biblioteca do Node-framework (ex: `#/http/interfaces/SwaggerConfig.ts`)

2. **typeName** (string): O nome exato da interface a ser usada para validação. Este nome deve corresponder
   exatamente ao que está definido no arquivo.

3. **tsconfigPath** (string, opcional): Caminho para o arquivo tsconfig.json a ser usado. Se não for fornecido,
   será usado o arquivo tsconfig.json no diretório de trabalho atual.

### Parâmetros do Método validate

1. **data** (any): Objeto a ser validado contra a interface.

2. **logger** (LoggerInterface, opcional): Um objeto que implementa a interface LoggerInterface, usado para registrar os erros de validação de forma detalhada.

## Exemplos

### Exemplo 1: Validando Configuração

```typescript
// Defina uma interface em library/http/interfaces/SwaggerConfig.ts
export interface SwaggerConfig {
  enabled: boolean
  baseUrl?: string
  version?: string
}

// No código da sua aplicação
import { ValidatorByInterface } from "@agtm/node-framework"

const swaggerConfigValidator = new ValidatorByInterface(
  "#/http/interfaces/SwaggerConfig.ts", // Caminho completo obrigatório
  "SwaggerConfig", // Nome exato da interface
)

// Valide a configuração
const config = {
  enabled: true,
  baseUrl: "/api/docs",
}

swaggerConfigValidator.validate(config) // Validará com sucesso

// Exemplo de configuração inválida
const configInvalido = {
  enabled: "sim", // Erro de tipo: deveria ser booleano
}

swaggerConfigValidator.validate(configInvalido) // Lançará um erro de validação
```

### Exemplo 2: Validando Entrada do Usuário

```typescript
// Defina uma interface em library/user/interfaces/userInput.interface.ts
export interface UserInput {
  username: string
  email: string
  age: number
  /** @default true */
  active?: boolean
}

// No seu manipulador de API
import { ValidatorByInterface } from "@agtm/node-framework"

const userInputValidator = new ValidatorByInterface("library/user/interfaces/userInput.interface.ts", "UserInput")

function createUser(userData: unknown) {
  // Valide os dados do usuário contra a interface
  userInputValidator.validate(userData)

  // Se a validação passar, prossiga com a criação do usuário
  // ...
}
```

## Valor Default

É possível definir valores default para propriedades opcionais usando o comentário JSDoc `@default` na interface. Quando
um objeto é validado, os valores default serão aplicados automaticamente às propriedades ausentes.

### Exemplo de Uso de Valores Default

É possível definir valores default no objeto a ser validado 


## Notas Importantes

1. **Nome Exato da Interface**: O parâmetro de nome da interface deve corresponder exatamente ao nome da classe da interface definida no
   arquivo.
2. **Validação em Tempo de Execução**: Isso fornece validação em tempo de execução, apesar das interfaces TypeScript
   serem apagadas durante a compilação.
3. Uso Opcional de Logger: Se um logger for passado, erros serão impressos de forma estruturada antes de lançar a exceção.
4. A instanciação é uma operação demorada, deve ser executado uma vez de preferência ao carregar o modulo nodejs.
5. Dentro das interfaces não é permitido utilizar alias como "#/"

## Tratamento de Erros

Quando a validação falha, o `ValidatorByInterface` lança mensagens de erro detalhadas que ajudam a identificar quais
propriedades falharam na validação e por quê:

```typescript
try {
  validator.validate(objetoInvalido)
} catch (error) {
  console.error("Falha na validação:", error.message)
  // Trate a falha na validação
}
```
