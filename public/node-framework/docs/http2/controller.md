# Controller

- Cada Controller está vinculado a uma ou mais rota.
- De forma simplificada controller são conjunto de métodos que são chamado para determinada rota

## Exemplo Básico

Para rota:

tenant.router.ts

```typescript
import {ApiRouter} from "@agtm/node-framework"

export default class TenantRouter extends ApiRouter {
  async setup() {
    this.get("/tenant/by-domain/:domain", "getTenantByUrl")
  }
}
```

Temos o controller:

tenant.controller.ts

```typescript
import type {FastifyReply, FastifyRequest} from "fastify"

import {ApiController} from "@agtm/node-framework"

export default class TenantController extends ApiController {
  async getTenantByUrl(request: FastifyRequest, reply: FastifyReply) {
    const {domain} = request.params as ParamInterface
    return reply.send("OK")
  }
}
```

**IMPORTANTE:** para cada rota chamada **tenant.router.ts**, temos que ter um **tenant.controller.ts**. O nome do
arquivos devem ser o mesmo mudando apenas a extensão

## Rotas automáticas

Caso você tenha definido uma configuração automática (tenant.auto.json), alguns controllers serão definidos
automaticamente:

- **create:** Controller padrão para criar novo registro
- **getAll:** Controller padrão para retornar todos os registros
- **get:** Controller padrão para retornar um registro baseado no id
- **update:** Controller padrão para atualizar registro automaticamente
- **delete:** Remove registro
- **schema:** Gera um CrudSchema usado pelo front end para gerar crud automaticamente

Porém você pode personalizar o comportamento da rota sobrescrevendo o método no controller desejado.

## Métodos Especiais:

- **init()** Não deve ser criado, é usado internamente, se reescrever a rota irá parar de funcionar
- **setup()** Aqui você pode executar algum código de inicialização, que será executado automaticamente na inicialização
  do servidor.

- Exemplo:

```typescript
import type {FastifyReply, FastifyRequest} from "fastify"

import {ApiController} from "@agtm/node-framework"
import {GetTenantByDomainUseCase} from "../../useCases/tenant/GetTenantByDomainUseCase.ts"

export default class TenantController extends ApiController {
  private getTenantByDomainUseCase!: GetTenantByDomainUseCase

  async setup() {
    this.getTenantByDomainUseCase = new GetTenantByDomainUseCase(prisma)
  }

  async getTenantByUrl(request: FastifyRequest, reply: FastifyReply) {
    const {domain} = request.params as ParamInterface
    return reply.send(await this.getTenantByDomainUseCase.execute(domain))
  }
}
```

## Atributos especiais

Em qualquer rota você terá acesso a alguas propriedades especiais do controller:

### logger

Permite registrar log padronizado no servidor. Será usado o log definido no sistema, por exemplo enviar para o logstash
ou imprimir no console

### config

Permite acessar as configurações da aplicação, ou variável de
ambiente [Veja mais detalhes em Config Service](../services/config.md)

### fastify

Instancia do servidor fastify, permite realizar configurações adicionais, geralmente utilizado no método setup, permite
operações como por exemplo:

- registrar plugins
- definir hooks 
- decorators
- rotas especiais
- ... entre outros

### prismaService

Serviço que gerencia as instancias do prisma, realiza conexão carrega configuração etc

É possível obter informações de métricas

### prisma

Atalho para `prismaService.getInstance()`

Acesso a instancia do ORM Prisma (Banco de dados) (conexão padrão)
