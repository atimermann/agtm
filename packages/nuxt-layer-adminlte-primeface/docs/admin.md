# Interface de Controle de Aplicações do Painel Administrativo

Este layer incorpora uma Interface de Controle, construída com o gerenciador de estados Pinia ou com composables, para
oferecer uma gestão centralizada de estados e configurações do painel administrativo. A API é projetada para oferecer
controle programático sobre diversos aspectos da interface do usuário (UI) do painel, permitindo uma interação dinâmica
e reativa com os componentes do painel.

Lembrando que cada modulo pode ter seu próprio conjunto de configuração definido em

* **appConfig:** Parâmetros que não podem ser alterados em tempo de execução, normalmente estrutural como habilitação do
  sistema de login.
* **env/runtimeConfig** Parâmetros que podem ser alterados em tempo de execução, na inicialização e definidos via
  váriavel de ambiente. Exemplo: endereço de servidor remoto.

## Acessando a Interface de Controle

Para integrar e utilizar as funcionalidades do painel administrativo em seu projeto utilize o alias @admin, por exemplo:

```javascript
import {useAppConfig, useMenuAdminStore} from '#imports'

// Config
const {admin: adminConfig} = useAppConfig()

// Store
const menuAdminStore = useMenuAdminStore()

menuAdminStore.defineMenu(adminConfig.menu)

if (adminConfig.auth.enabled) {
  menuAdminStore.addItemMenu({
    title: 'Sair',
    link: '/logout',
    iconClasses: [
      'pi',
      'pi-sign-out'
    ]
  }, 'inventory.productCategories')
}

```

Com o store/composable importado e instanciado corretamente, você agora tem acesso completo às suas ações e estados,
permitindo uma manipulação eficaz do painel administrativo.

Na documentação abaixo a titulo de simplificação é exibido apenas **auth.enabled**

---

# Refêrencia

## - useMenuStore

Controla o menu principal da barra lateral

### defineMenu()

Define o menu do painel administrativo usando um objeto de menu. Valida a estrutura do menu e indexa os itens do menu
para acesso rápido.

| Nome | Tipo | Padrão | Descrição                                 |
|------|------|--------|-------------------------------------------|
| menu | Menu | N/A    | Objeto de menu a ser definido e indexado. |

### addMenuItem()

Adiciona um novo item ao menu especificado ou ao menu principal, em uma posição especificada. Permite adicionar o item
diretamente em um submenu usando a chave do item de menu pai e especificar a posição como 'atStart', um índice
específico, 'atEnd' (padrão), 'before:<key>', ou 'after:<key>'.

| Nome      | Tipo     | Padrão  | Descrição                                                                                                                 |
|-----------|----------|---------|---------------------------------------------------------------------------------------------------------------------------|
| menuItem  | MenuItem | N/A     | O item de menu a ser adicionado.                                                                                          |
| parentKey | String   | `null`  | Chave do item de menu pai ao qual o novo item será adicionado como um sub-item. Opcional.                                 |
| position  | String   | 'atEnd' | Especifica a posição na qual inserir o novo menu item. Pode ser 'atStart', 'atEnd', 'before:\<key\>', ou 'after:\<key\>'. |

### setBadge()

Este método é utilizado para adicionar ou modificar um "distintivo" (badge) em um item específico do menu. Distintivos
são pequenas marcações gráficas ou etiquetas que servem para destacar informações adicionais sobre o item de menu, como
alertas, status, números indicativos (por exemplo, a quantidade de novas mensagens ou notificações), ou qualquer outra
informação breve que seja importante ressaltar visualmente ao usuário.

| Nome      | Tipo      | Padrão | Descrição                                                                                                                                                                                                                                                                                                                                                                                                                                      |
|-----------|-----------|--------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| menuKey   | String    | N/A    | A chave do item de menu ao qual o distintivo será definido.                                                                                                                                                                                                                                                                                                                                                                                    |
| badge     | String    | N/A    | O texto do distintivo a ser exibido no item de menu.                                                                                                                                                                                                                                                                                                                                                                                           |
| badgeType | BadgeType | 'info' | O tipo do distintivo, que determina sua aparência visual (cor e estilo). Por exemplo, 'success' pode exibir o distintivo em verde, indicando uma operação bem-sucedida, enquanto 'danger' pode usar vermelho para alertas ou avisos importantes. Valores opcionais incluem 'primary', 'secondary', 'success', 'info', 'warning', 'danger', 'light', e 'dark'. O padrão é 'info', que geralmente é usado para informações neutras ou genéricas. |

### toggleMenuItem()

Alterna o estado de aberto de um item de menu específico identificado por sua chave.

| Nome    | Tipo   | Padrão | Descrição                                                                                                      |
|---------|--------|--------|----------------------------------------------------------------------------------------------------------------|
| menuKey | String | N/A    | A chave única do item de menu a ser alternado. Assume que o nome do item de menu é uma chave em `indexedMenu`. |

### Configurações (appConfig)

| Atributo | Tipo   | Padrão | Descrição         |
|----------|--------|--------|-------------------|
| menu     | object |        | Estrutura do menu |

## - useAuthStore

## useAuthStore

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

| Variável de ambiente             | Tipo   | Padrão | Descrição                             |
|----------------------------------|--------|--------|---------------------------------------|
| NUXT_PUBLIC_ADMIN_AUTH_URL       | String | N/A    | Endereço do servidor de autenticação. |
| NUXT_PUBLIC_ADMIN_AUTH_CLIENT_ID | String | N/A    | Client ID da aplicação.               |

---

# Desenvolvimento/Checklist

* Após criar nova store ou novo composable é necessário atualizar a exportação no arquivo src/admin.mjs
* Enquando desenvolve as interface mantenha esta documentação aberta e atualizada, principalmente a refêrencia de
  métodos e propriedades.
* Não esquecer de atualizar em nuxt.config.mjs os atributos do runtimeConfig
* Documentar configurações defininas para store: .env, runtimeConfig ou appConfig
* Mantenha o template em @agtm/ncli atualizado.
