# Plugin Keycloak

Plugin implementado internamente no node-framework que habilita autenticação com servidor externo keycloak

**DICA:** Temos um script nf-keycloak que permite executar comandos de integração com o keycloak, direto no cli 

## Guia de Uso

### Habilitando o plugin

Por padrão vem desativado, habilite no config.\*.yaml:

exemplo:

```yaml
httpServer2:
  enabled: true
  plugins:
    keycloak: true
```

### Configuração

Algumas variáveis de ambiente devem ser definida:

```dotenv
# Url completa do servidor de authenticação
NF_KEYCLOAK_BASE_URL="https://auth.teste.com.br"

# Realm no keycloack
NF_KEYCLOAK_REALM="teste"

# Cliente ID (deve ser cadastrado no keycloak)
NF_KEYCLOAK_CLIENT_ID="teste-platform-server"

# Secrete do cliente
NF_KEYCLOAK_CLIENT_SECRET="vscE7QT8UaDeARP7gvEVZ4ZWXq2F7Kzn"
```

**OBSERVAÇÃO:**
Atualmente configuração do keycloak está fixo, ou seja , só temos a possibilidade de ter um servidor de autenticação.
No script keycloak eu já deixei genérico podemos selecionar várias instancias.

- Porém nas rotas só pode ser usado um, se haver necessidade de utilizar mais de um servidor de autenticação será
  necessário alterar o autoschema para suportar esse parâmetro e tb definir uma forma de passar esse Parãmetro para
  cada rota.

### Definindo rotas:

Caso o plugin seja habilitado passa a ser obrigatório definir se a rota é publica ou protegida explicitamente

Exemplo:

```typescript
// Rota Publica
this.get("/tenant/by-domain/:domain", "getTenantByUrl", schema).public()

// Rota Protegida
this.get("/tenant/by-domain/:domain", "getTenantByUrl", schema).auth()

// Rota Protegida com restrição de permissão (roles)
this.get("/tenant/by-domain/:domain", "getTenantByUrl", schema).auth(["admin", "tenant-domain"])
```

No ultimo exemplo a rota só será autorizada se o usuário tiver uma das permissões especificada

### Configurando ApiAuto

Para habilita autorização automaticamente no schema do ApiAuto temos 3 cenários:

**Habilita autorização para todas as rotas sem exigir permissões:**

```json
{
  "model": "tenant",
  "key": "id",
  "route": "tenants",
  "docs": {
    "name": "Tenants",
    "description": "Permite a gestão de múltiplos clientes dentro do sistema. (White-label)"
  },
  "auth": true,
  "fields": [
    {
      "name": "domain",
      "dbName": "domain",
      "type": "string",
      "default": "example.com.br",
      "unique": true,
      "required": true
    },
    {
      "name": "ownerId",
      "type": "integer",
      "default": 1,
      "uiProperties": {
        "label": "Conta"
      }
    }
  ]
}
```

**Habilita autorização para todas as rotas exigindo permissão:**

```json
{
  "auth": ["account.admin", "account.my-role"]
}
```

**Habilita autorização por operação:**

neste cenáro temos especificar 6 operações diferentes
```json
{
  "auth": {
    "getAll": ["manage-account"],
    "get": true,
    "create": ["account.ADMIN", "TENANT_CREATOR"],
    "update": ["TENANT_UPDATER"],
    "delete": ["TENANT_DELETER"],
    "schema": true
  }
}
```

**IMPORTANTE:** 
  - A permissão é composta por duas partes: [NOME_DO_CLIENT].[NOME_DA_PERMISSÃO(ROLE)]
    - Se **NOME_DO_CLIENTE** não for definido ele utilizar permissão do REALM (realm_access)
    - Se definido vai pegar pelo nome do cliente em **resource_access**
    - Veja abaixo o token decodificado para entender melhor

### Uso no controller

Uma rota autenticada vai disponibilizar 2 valores no Request:

#### user

È um objeto com todos os dados do usuário, nada mais é que o access token decodificado ex:

```yaml
{
  exp: 1742151764,
  iat: 1742151464,
  jti: 'feca8363-c9d5-41aa-8e32-2f79aee6be95',
  iss: 'https://auth.com.br/realms/teste',
  aud: 'account',
  sub: '4f6a9a87-74fd-4fb1-871a-4fe8c76dbbb2',
  typ: 'Bearer',
  azp: 'teste-platform-webui',
  session_state: '0fb6354e-002f-4eb6-a16d-b01fa09e0d3d',
  acr: '1',
  'allowed-origins': [
    'http://localhost:3030',
    'http://localhost:3000',
    'http://191.252.191.40'
  ],
  realm_access: {
    roles: [
      'offline_access',      
      'uma_authorization',
      'default-roles-teste'
    ]
  },
  resource_access: { account: { roles: [Array] } },
  scope: 'email profile',
  sid: '0fb6354e-002f-4eb6-a16d-b01fa09e0d3d',
  email_verified: true,
  name: 'André Timermann',
  preferred_username: 'andre',
  given_name: 'André',
  family_name: 'Timermann',
  email: 'andre@timermann.com.br'
}

```

#### roles

Lista de todas as permissões(roles) do usuário, obtido processando a access token (user) decodificado
Permissões (roles) podem ser permissões do REAL, ou de um cliente, se for de um cliente ela é montada em duas parte
[NOME_DO_CLIENT].[ROLE]

Retrieves clientRoles from the decoded token.
Aggregates clientRoles from both `resource_access` and `realm_access`.
For `resource_access`, it prefixes each role with the resource name (e.g., "account.AAA").
For `realm_access`, clientRoles are added as-is.
Roles containing a dot are ignored with a warning.

