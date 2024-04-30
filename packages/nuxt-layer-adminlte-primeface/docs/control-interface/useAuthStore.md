# useAuthStore

**Tipo:** Store

Gerencia a autenticação do usuário. A autenticação é salva no localStorage.

**Importante:** É necessário habilitar a função de autenticação em **auth.enabled** como descrito abaixo.

**Persistência**

Os dados de autenticação são persistentemente armazenados usando o plugin `pinia-plugin-persistedstate`, permitindo que
o estado da autenticação seja mantido entre as sessões do navegador.

### Atributos

| Nome                  | Tipo    | Descrição                                                                                                             |
|-----------------------|---------|-----------------------------------------------------------------------------------------------------------------------|
| `authenticated`       | boolean | Indica se o usuário está atualmente autenticado.                                                                      |
| `accessToken`         | ?string | O token de acesso JWT recebido do servidor de autenticação.                                                           |
| `decodedToken`        | ?object | O token de acesso JWT decodificado contendo informações do usuário e da sessão.                                       |
| `expiresIn`           | ?number | Tempo em segundos quando o token de acesso irá expirar.                                                               |
| `refreshToken`        | ?string | O token de atualização usado para obter novos tokens de acesso.                                                       |
| `decodedRefreshToken` | ?object | O token de atualização JWT decodificado contendo informações do usuário e da sessão para atualizar o token de acesso. |
| `refreshExpiresIn`    | ?number | Tempo em segundos quando o token de atualização irá expirar.                                                          |
| `notBeforePolicy`     | ?number | A política de não-antes indica o tempo antes do qual o token não deve ser aceito.                                     |
| `sessionState`        | ?string | Representa o estado da sessão do usuário no servidor de autenticação.                                                 |
| `scope`               | ?string | O escopo do token de acesso indicando quais permissões foram concedidas.                                              |

### authenticate()

Autentica o usuário utilizando usuário e senha. Retorna um objeto com o status da autenticação.

| Nome     | Tipo   | Padrão | Descrição                          |
|----------|--------|--------|------------------------------------|
| username | String | N/A    | Nome de usuário para autenticação. |
| password | String | N/A    | Senha para autenticação.           |

#### Retorno

| Nome     | Tipo                                 | Descrição                                              |
|----------|--------------------------------------|--------------------------------------------------------|
| response | { success: Boolean, status: String } | Objeto contendo o status da tentativa de autenticação. |

### Configurações (appConfig)

Configurações necessárias para habilitar e configurar o módulo de autenticação.

| Atributo     | Tipo    | Padrão | Descrição                                    |
|--------------|---------|--------|----------------------------------------------|
| auth.enabled | Boolean | false  | Se o módulo de autenticação está habilitado. |

### Configurações (runtimeConfig)

Variáveis de ambiente necessárias para configurar o endereço do servidor de autenticação e o Client ID da aplicação.

| Propriedade  | Env                                 | Tipo     | Padrão | Descrição                                                                                                      |
|--------------|-------------------------------------|----------|--------|----------------------------------------------------------------------------------------------------------------|
| url          | NUXT_PUBLIC_ADMIN_AUTH_URL          | String   | ''     | Endereço do servidor de autenticação.                                                                          |
| clientId     | NUXT_PUBLIC_ADMIN_AUTH_CLIENT_ID    | String   | ''     | ID que identifica o admin no servidor de autenticação.                                                         |
| role.enabled | NUXT_PUBLIC_ADMIN_AUTH_ROLE_ENABLED | Bool     | false  | Ativa a autenticação baseada em roles. O usuário deve possuir uma ou mais roles específica para autenticar-se. |
| role.path    | NUXT_PUBLIC_ADMIN_AUTH_ROLE_PATH    | String   | ''     | Localização da lista de roles no access_token. <br/>Exemplo: resource_access.adminui.roles                     |
| role.roles   | NUXT_PUBLIC_ADMIN_AUTH_ROLE_ROLES   | String[] | []     | Define as roles exigidas para a autenticação do usuário no painel admin.                                       |
