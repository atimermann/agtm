# ValidatorByInterface

Um utilitário de validação de tipos em tempo de execução para o Node-framework que valida objetos contra interfaces
TypeScript.

## Visão Geral

O `ValidatorByInterface` permite a validação em tempo de execução de objetos contra interfaces TypeScript, o que é
particularmente útil para validar objetos de configuração ou entrada do usuário.

## Instalação

Esta utilidade está disponível apenas dentro do ambiente Node-framework. Nenhuma instalação adicional é necessária.

## Uso

### Exemplo Básico

```typescript
import type { LoggerInterface } from "#/loggers/logger.interface.js"
import type { SwaggerConfig } from "#/http/interfaces/swaggerConfig.interface.js"

import Config from "#/config.js"
import ValidatorByInterface from "#/utils/validatorByInterface.js"

const swaggerConfigValidator = new ValidatorByInterface(
  "library/http/interfaces/swaggerConfig.interface.ts",
  "SwaggerConfig",
)

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

### Parâmetros

1. **interfacePath** (string): O caminho absoluto para o arquivo da interface a partir da raiz do Node-framework. Este
   deve ser o caminho completo começando do diretório raiz.

2. **interfaceName** (string): O nome exato da interface a ser usada para validação. Este nome deve corresponder
   exatamente ao que está definido no arquivo.

3. logger? (object, opcional): Um objeto que implementa error(), usado para registrar os erros de validação de forma detalhada.


## Exemplos

### Exemplo 1: Validando Configuração

```typescript
// Defina uma interface em library/http/interfaces/swaggerConfig.interface.ts
export interface SwaggerConfig {
  enabled: boolean
  baseUrl?: string
  version?: string
}

// No código da sua aplicação
import ValidatorByInterface from "#/utils/validatorByInterface.ts"

const swaggerConfigValidator = new ValidatorByInterface(
  "library/http/interfaces/swaggerConfig.interface.ts", // Caminho completo obrigatório
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
}

// No seu manipulador de API
import ValidatorByInterface from "#/utils/validatorByInterface.ts"

const userInputValidator = new ValidatorByInterface(
  "library/user/interfaces/userInput.interface.ts",
  "UserInput",
)

function createUser(userData: unknown) {
  // Valide os dados do usuário contra a interface
  userInputValidator.validate(userData)

  // Se a validação passar, prossiga com a criação do usuário
  // ...
}
```

## Notas Importantes

1. **Caminho Completo Obrigatório**: Sempre use o caminho completo a partir da raiz do projeto Node-framework.
2. **Exclusivo do Node-framework**: Esta utilidade atualmente funciona apenas dentro do ambiente Node-framework.
3. **Nome Exato da Interface**: O parâmetro de nome da interface deve corresponder exatamente à interface definida no
   arquivo.
4. **Validação em Tempo de Execução**: Isso fornece validação em tempo de execução, apesar das interfaces TypeScript
   serem apagadas durante a compilação.
5. Uso Opcional de Logger: Se um logger for passado, erros serão impressos de forma estruturada antes de lançar a exceção.

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
