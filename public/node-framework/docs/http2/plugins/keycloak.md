# Plugin Keycloak

O plugin Keycloak é uma solução robusta para autenticação e autorização em aplicações Node.js, utilizando o Keycloak como provedor de identidade.

## Índice

1. [Configuração](#configuração)
2. [Configuração de Rotas](#configuração-de-rotas)
3. [Roles e Permissões](#roles-e-permissões)
4. [Exemplos Práticos](#exemplos-práticos)
5. [Tratamento de Erros](#tratamento-de-erros)

## Configuração

### Ativação do Plugin

No NodeFramework, o plugin Keycloak pode ser ativado facilmente através do arquivo de configuração YAML:

```yaml
httpServer2:
  enabled: true
  plugins:
    keycloak: true
```

### Configuração do Keycloak

Exemplo definição de conexão com o servidor keycloak

```env
# Keycloak
NF_KEYCLOAK_BASE_URL="https://auth.exemplo.com.br"
NF_KEYCLOAK_REALM="meu-realm"
NF_KEYCLOAK_CLIENT_ID="meu-cliente"
NF_KEYCLOAK_CLIENT_SECRET="seu-client-secret-aqui"
```

## Configuração de Rotas

No NodeFramework, as rotas são definidas usando a classe `ApiRouter`. Existem duas formas principais de definir a autenticação:

### Rota Pública
```typescript
import type { ApiRouterInterface } from "@agtm/node-framework"
import { ApiRouter } from "@agtm/node-framework"

export default class PublicRouter extends ApiRouter implements ApiRouterInterface {
  async setup() {
    this.get("/public", "getPublicData").public()
  }
}
```

### Rota Protegida
```typescript
import type { ApiRouterInterface } from "@agtm/node-framework"
import { ApiRouter } from "@agtm/node-framework"

export default class ProtectedRouter extends ApiRouter implements ApiRouterInterface {
  async setup() {
    this.get("/protected", "getProtectedData").auth()
  }
}
```

### Rota com Roles Específicas
```typescript
import type { ApiRouterInterface } from "@agtm/node-framework"
import { ApiRouter } from "@agtm/node-framework"

export default class AdminRouter extends ApiRouter implements ApiRouterInterface {
  async setup() {
    this.get("/admin", "getAdminData").auth(["admin"])
    this.get("/manager", "getManagerData").auth(["admin", "manager"])
  }
}
```

## Exemplos Práticos

### API Completa com Diferentes Níveis de Acesso

```typescript
import type { ApiRouterInterface } from "@agtm/node-framework"
import { ApiRouter } from "@agtm/node-framework"

export default class ApiRouter extends ApiRouter implements ApiRouterInterface {
  async setup() {
    // Rota pública
    this.get("/api/public", "getPublicData").public()

    // Rota protegida básica
    this.get("/api/protected", "getProtectedData").auth()

    // Rota para administradores
    this.get("/api/admin", "getAdminData").auth(["admin"])

    // Rota para usuários com múltiplas roles
    this.get("/api/manager", "getManagerData").auth(["admin", "manager", "supervisor"])
  }
}
```

## Uso no Controller

O plugin Keycloak fornece informações do usuário autenticado através do objeto `request.auth`. Você pode acessar essas informações em seus controllers para realizar validações adicionais.

### Exemplo Básico de Controller

```typescript
import { ApiController, AuthRequest } from "@agtm/node-framework"

export default class UserController extends ApiController {
  async setup() {
    this.fastify.addHook("preHandler", async (request: AuthRequest) => {
      if (request.auth) {
        // Aqui você pode acessar as informações do usuário autenticado
        console.log("Usuário:", request.auth.preferred_username)
        console.log("Roles:", request.roles)
      }
    })
  }

  // Exemplo de método que usa as informações de autenticação
  async getProfile(request: AuthRequest) {
    return {
      username: request.auth?.preferred_username,
      email: request.auth?.email,
      roles: request.roles
    }
  }
}
```

### Informações Disponíveis no Request

Quando uma requisição é autenticada, o objeto `request.auth` contém as seguintes informações:

```typescript
interface AuthRequest {
  auth?: {
    sub: string;           // ID único do usuário no Keycloak
    email: string;         // Email do usuário
    preferred_username: string; // Nome de usuário preferido
    roles: string[];       // Lista de roles do usuário
    // ... outras informações do token JWT
  };
  roles?: string[];       // Lista de roles do usuário
}
```

### Boas Práticas

1. **Tipagem**: Use a interface `AuthRequest` para ter acesso às informações de autenticação
2. **Segurança**: Não exponha informações sensíveis do token em logs ou respostas
3. **Validação**: Sempre verifique se `request.auth` existe antes de acessar suas propriedades
