# - useMenuStore

**Tipo:** Store

Controla o menu principal da barra lateral

### defineMenu()

[DESCRIÇÃO]

#### Parâmetros

| Nome | Tipo | Padrão | Descrição                                 |
|------|------|--------|-------------------------------------------|
| menu | Menu | N/A    | Objeto de menu a ser definido e indexado. |

#### Retorno

NULL

#### Exemplo:

```javascript
import { useAppConfig, useMenuAdminStore } from '#imports'
const appConfig = useAppConfig()
appConfig.admin.logoPath = (await import('~/assets/img/logo.png')).default
const menuAdminStore = useMenuAdminStore()

menuAdminStore.defineMenu({
  items: [
    {
      id: 'dashboard',
      title: 'Dashboard',
      link: '/',
      iconClasses: [
        'pi',
        'pi-home'
      ]
    },
    {
      id: 'exit',
      title: 'Sair',
      link: '/login',
      iconClasses: [
        'pi',
        'pi-sign-out'
      ]
    }
  ]
})


```

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
