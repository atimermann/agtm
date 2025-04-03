# Plugin Keycloak

O plugin Keycloak é uma solução robusta para autenticação e autorização em aplicações Node.js, utilizando o Keycloak
como provedor de identidade.

## Índice

1. [Configuração](#configuração)
2. [Configuração de Rotas](#configuração-de-rotas)
3. [Roles e Permissões](#roles-e-permissões)
4. [Exemplos Práticos](#exemplos-práticos)
5. [Tratamento de Erros](#tratamento-de-erros)

# Configuração

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

# Configuração de Rotas

No NodeFramework, as rotas são definidas usando a classe `ApiRouter`. Existem duas formas principais de definir a
autenticação:

### Rota Pública

```typescript
import type {ApiRouterInterface} from "@agtm/node-framework"
import {ApiRouter} from "@agtm/node-framework"

export default class PublicRouter extends ApiRouter implements ApiRouterInterface {
  async setup() {
    this.get("/public", "getPublicData").public()
  }
}
```

### Rota Protegida

```typescript
import type {ApiRouterInterface} from "@agtm/node-framework"
import {ApiRouter} from "@agtm/node-framework"

export default class ProtectedRouter extends ApiRouter implements ApiRouterInterface {
  async setup() {
    this.get("/protected", "getProtectedData").auth()
  }
}
```

### Rota com Roles Específicas

```typescript
import type {ApiRouterInterface} from "@agtm/node-framework"
import {ApiRouter} from "@agtm/node-framework"

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
import type {ApiRouterInterface} from "@agtm/node-framework"
import {ApiRouter} from "@agtm/node-framework"

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

# Uso no Controller

O plugin Keycloak fornece informações do usuário autenticado através do objeto `request.auth`. Você pode acessar essas
informações em seus controllers para realizar validações adicionais.

### Exemplo Básico de Controller

```typescript
import {ApiController, AuthRequest} from "@agtm/node-framework"

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

# Modo desenvolvimento

É possível ativar o modo desenvolvimento, com ele não é necessário enviar no header o accessToken, agilizando o processo
de desenvolvimento e teste

Para ativar o modo de desenvolvimento:

### 1. Edite o arquivo **config.development.yaml:**

```yaml
httpServer2:
  plugins:
    keycloak:
      enabled: true
      # Habilita autenticação automática para teste de apis
      devMode:
        enabled: true
        username: "fulano"
        password: "abc123"
        clientId: "keycloak-client-id"
```

### 2. Certifique-se que está no ambiente de desenvolvimento.


### 3. Faça requisição para API **SEM** definir o token:


Em vez de: 
```http request
GET http://localhost:3001/tenants
Authorization: Bearer eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICIzamh0STFpV016cUxZNmxlQVh1TFNSSmRPQ2VrNHpkMFRTRnFBbHBhZEM0In0.eyJleHAiOjE3NDM1NjA1MDQsImlhdCI6MTc0MzU2MDIwNCwianRpIjoiNjY3YjdlZDItNzVkNS00OTQ5LTkzNmUtZjgzODU3ZDU4YmE3IiwiaXNzIjoiaHR0cHM6Ly9hdXRoLmNyb250ZWNoLmNvbS5ici9yZWFsbXMvY3JvbnRlY2giLCJhdWQiOiJhY2NvdW50Iiwic3ViIjoiNGY2YTlhODctNzRmZC00ZmIxLTg3MWEtNGZlOGM3NmRiYmIyIiwidHlwIjoiQmVhcmVyIiwiYXpwIjoiY3JvbnRlY2gtcGxhdGZvcm0td2VidWkiLCJzZXNzaW9uX3N0YXRlIjoiZDhhOTI2ZGYtMWEyNS00YTQ1LTg1MjEtZThlMTk4MDNmZWY0IiwiYWNyIjoiMSIsImFsbG93ZWQtb3JpZ2lucyI6WyJodHRwczovL3BsYXRmb3JtLmNyb250ZWNoLmNvbS5iciIsImh0dHA6Ly9sb2NhbGhvc3Q6MzAzMCIsImh0dHBzOi8vYXV0b21hdGUtaXRzbS5zZWxmaXAuaW5mbyIsImh0dHA6Ly9kZXYuY3JvbnRlY2guY29tLmJyIiwiaHR0cDovL3Rlc3RlLmNyb250ZWNoLmNvbS5icjozMDMwIiwiaHR0cDovL2xvY2FsaG9zdDozMDAwIiwiaHR0cDovLzE5MS4yNTIuMTkxLjQwIl0sInJlYWxtX2FjY2VzcyI6eyJyb2xlcyI6WyJvZmZsaW5lX2FjY2VzcyIsImNyb250ZWNoLXBsYXRmb3JtLWFwcGxpY2F0aW9uLWFjY2VzcyIsInVtYV9hdXRob3JpemF0aW9uIiwiZGVmYXVsdC1yb2xlcy1jcm9udGVjaCJdfSwicmVzb3VyY2VfYWNjZXNzIjp7ImFjY291bnQiOnsicm9sZXMiOlsibWFuYWdlLWFjY291bnQiLCJtYW5hZ2UtYWNjb3VudC1saW5rcyIsInZpZXctcHJvZmlsZSJdfX0sInNjb3BlIjoiZW1haWwgcHJvZmlsZSIsInNpZCI6ImQ4YTkyNmRmLTFhMjUtNGE0NS04NTIxLWU4ZTE5ODAzZmVmNCIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJuYW1lIjoiQW5kcsOpIFRpbWVybWFubiIsInByZWZlcnJlZF91c2VybmFtZSI6ImFuZHJlIiwiZ2l2ZW5fbmFtZSI6IkFuZHLDqSIsImZhbWlseV9uYW1lIjoiVGltZXJtYW5uIiwiZW1haWwiOiJhbmRyZUB0aW1lcm1hbm4uY29tLmJyIn0.o-NN6H309RGXIjLqa4bUkjH8-RIfEp9jrcfZy99KeNcUSn2hThhsA8ulyehD-1S7BcBdNVb-z7QG61d85sY-4zEnSiUr3HAGK1Ge-2GXrEBSG2zNZqdfcViWYjWTRdFtOTnrqFg1VZO5Nb6zPcJjDuf4whmWhnpRCzrHsn_BpXRorOfAIHDkg_PZ76g2YPgDoUTlIlyrkOTCK_RPbb5w7EmrHS_jFf-2oAOdYTQROARCu4WVRfs21nrqd7AaPcCan7Aum4uJFxlfhGtIfvpRMfQk37J7f34O8gjQXKqjzIN7Osfzc2qvGCVQw2RQtW6Yliu42ACYTdBGsRevNbha2A
Tenant-UUID: a30bce28-b538-4882-b720-a760b43cfb17
```

Faça:
```http request
GET http://localhost:3001/tenants
Tenant-UUID: a30bce28-b538-4882-b720-a760b43cfb17
```

**Nota:** Se enviar o token o modo desenvolvimento não será ativado
