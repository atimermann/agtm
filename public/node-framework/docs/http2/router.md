# Rotas

- Gerenciado internamente pelo RouterService (e instâncias de ApiRouter), onde a API é efetivamente configurada.
- Ponto de entrada para a definição das rotas da aplicação.
- Cada rota define o endpoint, o controller responsável e esquemas de validação (schemas).
- Carrega e instancia automaticamente:
  Controllers (lógica de negócios de cada rota).
  Schemas de validação, quando definidos em arquivos .auto.json.

* Permite configurar rotas de forma manual ou automática (por meio de \*.auto.json).

## Definindo Rotas

Para definir rotas em nossa aplicação devemos criar o arquivo com extensão `.router.ts` na pasta do endpoint:

```
src/apps/[NOME_APP]/http/[NOME_RECURSO]/[ARQUIVO_DE_ROTA].router.ts
```

Exemplo:

```typescript
import type { ApiRouterInterface } from "@agtm/node-framework"
import { ApiRouter } from "@agtm/node-framework"

export default class UserRoutes extends ApiRouter implements ApiRouterInterface {
  async setup() {
    const schema = {
      tags: ["Tenants"],
      summary: "Retorna informação de um tenant a partir do domínio fornecido",
      params: {
        type: "object",
        properties: {
          domain: { type: "string" },
        },
        required: ["domain"],
      },
    }

    // Define uma rota pública
    this.get("/tenant/by-domain/:domain", "getTenantByUrl", schema).public()

    // Define uma rota protegida com autenticação e roles restritas
    this.get("/minhaRotaRestrita", "getTenantByUrl", schema).auth(["ADMIN", "USER"])
  }
}
```

- Devemos definir todas as nossas rotas dentro do método setup()
- Se o plugin de autentiação keycloak estiver ativo temos q definir explicitamente se é publica ou exige autorização
- Ao definir a rota podemos passar os seguintes parâmetros:

### 1ª URL relativa rota

Primeiro argumento é a url da rota, seguindo o padrão do fastify de definição de rota

REF: https://fastify.dev/docs/latest/Reference/Routes/#url-building

### 2ª Handler

Pode ser o nome do método no controller, esse controller deve estar no mesmo diretório do arquivo de rota e ter o mesmo
nome com extensão .controller.ts

Também é possível definir uma função diretamente sem o controller, deve ter a assinatura manipulador da rota no Fastify

Ref: https://fastify.dev/docs/latest/Reference/Routes/#shorthand-declaration

### 3ª Schema

Schema de configuração da rota, também padrão do fastify, é aqui que definimos todas as configurações da rota, como
validação, serialização, tipo de parâmetro, documentação (swagger) enter outros

Ref: https://fastify.dev/docs/latest/Reference/Validation-and-Serialization/

### 4ª Opções Extras

Todas as outras opções aceitas pelo fastify, incluí também configuração de plugins como autorização do keycloak

o método ->auth() e ->public() nada mais são que atalhos (suger syntax) para este método com opções apropriadas

ReF: https://fastify.dev/docs/latest/Reference/Routes/#routes-options

# Métodos Auxiliares

Alguns atalhos foram disponibilizados para facilitar legibilidade do código nas definições de rotas, e facilitar
configuração complexa:

## auth(roles)

Usado em plugins de autenticação, permite definir se uma rota é protegida e se depende de permissões.

exemplo:

```typescript
this.get("/tenant/by-domain/:domain", "getTenantByUrl", schema).auth(["ADMIN", "MY_ROLES")
```

Atalho para:

```typescript
const options = {
  config: { auth: true, roles: ["ADMIN", "MY_ROLES"] },
}

this.get("/tenant/by-domain/:domain", "getTenantByUrl", schema, options)
```

## public()

Usado em plugins de autenticação, indica que uma rota é publica

```typescript
this.get("/tenant/by-domain/:domain", "getTenantByUrl", schema).public()
```

Atalho para:

```typescript
const options = {
  config: { auth: false},
}

this.get("/tenant/by-domain/:domain", "getTenantByUrl", schema, options)
```
