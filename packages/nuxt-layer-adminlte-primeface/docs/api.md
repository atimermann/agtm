# Interface de Controle de Aplicações do Painel Administrativo

Este layer incorpora uma Interface de Controle, construída com o gerenciador de estados Pinia, para oferecer uma gestão
centralizada de estados e configurações do painel administrativo. A API é projetada para oferecer controle programático
sobre diversos aspectos da interface do usuário (UI) do painel, permitindo uma interação dinâmica e reativa com os
componentes do painel.

## Acessando a Interface de Controle

Devido a particularidades da arquitetura do layer do Nuxt, o store não é automaticamente importado pelo sistema de
auto-import padrão do Nuxt. Isso implica uma abordagem alternativa para acessar e interagir com o store dedicado ao
painel administrativo.

Para integrar e utilizar as funcionalidades do painel administrativo em seu projeto, é necessário importar
explicitamente o store. Utilize a seguinte sintaxe de importação para acessar o store do painel administrativo:

```javascript
import { useAdminStore } from '@agtm/nuxt-layer-adminlte-primeface/store';

const adminStore = useAdminStore();
```

Com o store importado e instanciado corretamente, você agora tem acesso completo às suas ações e estados, permitindo uma
manipulação eficaz do painel administrativo.

### Exemplo de Navegação entre Menus

Para ativar ou focar em um item específico do menu, você pode utilizar o método toggleMenuItem do store, passando o
nome (chave) do item de menu que deseja acessar:

```javascript
// Ativando o item de menu 'Estoque'
adminStore.toggleMenuItem('Estoque');
```

[Clique aqui para saber como configurar o menu](./menu.md)

## Refêrencia de métodos(actions) e propriedades

