# Interface de Controle de Aplicações do Painel Administrativo

Este layer incorpora uma Interface de Controle, construída com o gerenciador de estados Pinia ou com composables, para
oferecer uma gestão centralizada de estados e configurações do painel administrativo. A API é projetada para oferecer
controle programático sobre diversos aspectos da interface do usuário (UI) do painel, permitindo uma interação dinâmica
e reativa com os componentes do painel.

A interface de controle é separada por módulos que devem ser importadas separadamente, por exemplo, para uma importação
para gerenciar aspectos da autenticação e outro do menu.

Cada modulo pode ter seu próprio conjunto de configuração definido em

* **appConfig:** Parâmetros que não podem ser alterados em tempo de execução, normalmente estrutural como habilitação do
  sistema de login.
  * Ex: é definido ao compilar imagem docker e não pode mais ser alterado posteriormente
* **env/runtimeConfig** Parâmetros que podem ser alterados em tempo de execução, na inicialização e definidos via
  váriavel de ambiente. Exemplo: endereço de servidor remoto.
  *
    * Ex: Pode ser alterado ao iniciar container

## Acessando a Interface de Controle

Para acessar uma interface de controle, você pode importar como no exemplo abaixo:

```javascript
// Vamos carregar o Editor de Menu
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

# Refêrencia

Refêrencia completa de cada modulo neste diretório:

* [useAuthStore](useAuthStore.md)
* [useMenuStore](useMenuStore.md)
* [useLayoutStore](useLayoutStore.md)

# [DEV] Criando novos Modulos

Antes de iniciar um novo modulo verifique o checklist abaixo:

* Um modulo pode ser um composable ou uma store pinia, normalmente pinia é recomendável por facilitar a manutenção de
  estado.
* Após criar nova store ou novo composable é necessário atualizar a exportação no arquivo src/admin.mjs
* Enquanto desenvolve as interface mantenha esta documentação aberta e atualizada, principalmente a refêrencia de
  métodos e propriedades.
* Não esquecer de atualizar em nuxt.config.mjs os atributos do runtimeConfig
* Documentar configurações defininas para store: .env, runtimeConfig ou appConfig
* Mantenha o template em @agtm/ncli atualizado.
* Siga o template template.md
* Implemente testes, se possível TDD
* Crie exemplos
