# Interface de Controle de Aplicações do Painel Administrativo

Este layer incorpora uma Interface de Controle, construída com o gerenciador de estados Pinia ou com composables, para
oferecer uma gestão centralizada de estados e configurações do painel administrativo. A API é projetada para oferecer
controle programático sobre diversos aspectos da interface do usuário (UI) do painel, permitindo uma interação dinâmica
e reativa com os componentes do painel.

## Acessando a Interface de Controle

Para integrar e utilizar as funcionalidades do painel administrativo em seu projeto utilize o alias @admin, por exemplo:

```javascript

import {useMenuStore} from '@admin'

const menu = useMenuStore()

// Adiciona um marcador ao menu dashboard com o valor 10 (também suporte string)
menu.setBadge('dashboard', 10)

// Simula clique no menu inventory (abre ou fecha, dependendo do status atual) 
menu.toggleMenuItem('inventory')

```

Com o store/composable importado e instanciado corretamente, você agora tem acesso completo às suas ações e estados,
permitindo uma
manipulação eficaz do painel administrativo.

# Refêrencia

## useMenuStore

Controla o menu principal da barra lateral

| Função               | Tipo         | Padrão | Descrição                                                                                            |
|----------------------|--------------|--------|------------------------------------------------------------------------------------------------------|
| **defineMenu()**     |              |        | Define o menu do painel administrativo usando um objeto de menu.                                     |
| menu                 | Object(Menu) |        | O objeto de menu a ser definido e indexado.                                                          |
| **setBadge()**       |              |        | Define o distintivo e o tipo de distintivo para um determinado item de menu.                         |
| menuKey              | String       |        | O nome do item de menu ao qual o distintivo será definido.                                           |
| badge                | String       |        | Estilo: 'primary', 'secondary', 'success', 'info', 'warning', 'danger', 'light', 'dark'              |
| **toggleMenuItem()** |              |        | Alterna o estado de aberto de um item de menu específico identificado por sua chave.                 |
| menuKey              | String       |        | A chave única do item de menu a ser alternado. Esta chave é derivada do id do item ou do seu título. |

## useAuthStore

# Desenvolvimento

* Após criar nova Store ou novo composable é necessário atualizar a exportação no arquivo src/admin.mjs
* Enquando desenvolve as interface mantenha esta documentação aberta e atualizada, principalmente a refêrencia de
  métodos e propriedades.
