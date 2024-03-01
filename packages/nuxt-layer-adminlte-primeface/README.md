# Nuxt Layer AdminLTE + PrimeFace

Este projeto introduz uma camada (layer) para o Nuxt 3, desenvolvida para facilitar a integração do PrimeVue 3 e do
AdminLTE 3 em aplicações web. Essa camada é projetada para ser facilmente incorporada em qualquer projeto Nuxt 3,
oferecendo um template completo e funcional para a construção de interfaces de usuário ricas e painéis administrativos.

Para detalhes adicionais sobre o Nuxt 3, consulte a documentação oficial do Nuxt 3.
([Leia sobre layer aqui](https://nuxt.com/docs/guide/going-further/layers))

## Principais Características

* Esta layer utiliza o template [AdminLTE 3](https://adminlte.io/themes/v3/) como base
* Integrado com [PrimeVue 3](https://primefaces.org/primevue/) e PrimeGrid para montagem de layout e utilização de
  componentes

## Instalação

Para iniciar um novo projeto já configurado com esta camada, siga os passos abaixo:

```bash
  npm i -g @agtm/ncli   
# Em seguida crie um novo projeto com o comando abaixo:
  ncli create-nuxt  
```

**Este script irá:**

* Instalar o Nuxt3.
* Criar um novo projeto utilizando o script padrão do Nuxt.
* Configurar o projeto com todos os requisitos e dependências necessários para rodar, incluindo Pinia, PrimeVue, entre
  outros.
* Configurar o diretório de fontes para src.

**Notas**

* Vite.server.fs.strict = true permite que o vite acesse arquivos fora do diretório src, por exemplo ao utilizar npm
  link. [Rererência aqui](https://vitejs.dev/config/server-options.html#server-fs-allow)

## Configurando seu projeto

Para customizar seu template, habilitar funcionalidades acesse a configuração:

[Consulte aqui refêrencia completa do app.config](./docs/config.md)

## Interface de Controle de Aplicações do Painel Administrativo

Este layer incorpora uma **Interface de Controle**, construída com o gerenciador de estados Pinia ou com composables,
para oferecer uma gestão centralizada de estados e configurações do painel administrativo. A interface é projetada para
oferecer controle programático sobre diversos aspectos da interface do usuário (UI) do painel, permitindo uma interação
dinâmica e reativa com os componentes do painel.

### Exemplo

Através dessa interface de controle, os desenvolvedores têm acesso a um conjunto de métodos que permitem:

* **Navegação Dinâmica:** Programaticamente ativar ou focar em um item de menu específico, facilitando a navegação
  baseada em ações do usuário ou eventos do sistema.
* **Indicadores de Notificação:** Definir contadores ou indicadores em itens de menu, útil para exibir a quantidade de
  ações pendentes, como mensagens não lidas, diretamente na UI do painel.
* **Gestão de Notificações:** Inserir mensagens na caixa de notificações do administrador, permitindo o envio de alertas
  ou informações importantes para os usuários do painel. (Funcionalidade em desenvolvimento)

### Documentação e Exemplos de Uso

Para uma compreensão detalhada dos métodos disponíveis, parâmetros esperados, e exemplos de uso prático da API do painel
administrativo, consulte a documentação técnica completa disponível em:

[Documentação Interface de Controle](./docs/admin)

## Desenvolvendo seu projeto em conjunto com o template

[Clique aqui para entender como trabalhar com este template em seu projeto](./docs/config.md)

## Layouts

[Documentação completa sobre Layout](./docs/layout.md)

## Arquivo App.vue

Este template inclui um arquivo `app.vue` com o seguinte conteúdo:

```vue

<template>
  <NuxtLayout/>
</template>
```

Este arquivo serve como um ponto de entrada para os layouts e páginas da sua aplicação. O componente `<NuxtLayout />` é
responsável por renderizar o layout apropriado, dependendo da configuração das metadados da página.

## Uso do PrimeVue

Cada componente do PrimeVue pode ser importado individualmente, garantindo que você inclua no pacote apenas o que
realmente utilizar. O caminho de importação está disponível na documentação do componente correspondente.

Por exemplo, para importar e utilizar o componente `Button` do PrimeVue:

```javascript
import Button from "primevue/button"

const app = createApp(App);
app.component('Button', Button);
```

Você pode simplesmente criar um plugin para isso:

Exemplo:

    src/plugins/primevue.mjs

```javascript
import {defineNuxtPlugin} from '#app'

// Módulos carregados
import Card from 'primevue/card'

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.component('Card', Card)
})
```

# Primeiros passos

Depois de tudo configurado, [entre aqui para começar desenvolver sua aplicação.](./docs/first-step.md)

# Componentes

Foi desenvolvido alguns componentes baseado no AdmiLte não vinculado ao PrimeVue:

### NfCard

[Documentação aqui](./docs/components/nf-card.md)

# Módulos

## Autenticação e Autorização

[Documentação aqui](./docs/modules/auth.md)

# Desenvolvimento

**IMPORTANTE:** Mantenha sempre documentação atualizada enquanto desenvolve, devido a complexidade do projeto

Para obter mais informações sobre como implementar e trabalhar com camadas (layers) no Nuxt, consulte
a [documentação oficial do Nuxt sobre a criação de layers](https://nuxt.com/docs/getting-started/layers).

## Working on your theme

Your theme is at the root of this repository, it is exactly like a regular Nuxt project, except you can publish it on
NPM.

The `playground` directory should help you on trying your theme during development.

Running `npm dev` will prepare and boot `playground` directory, which imports your theme itself.

## Development Server

Start the development server on http://localhost:3000

```bash
npm run dev
```

Checkout the [deployment documentation](https://v3.nuxtjs.org/docs/deployment) for more information.
