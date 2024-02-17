# Nuxt Layer AdminLTE + PrimeFace

Este projeto é uma camada do Nuxt 3 (layer). ([Leia sobre layer aqui](https://nuxt.com/docs/guide/going-further/layers))

Desenvolvida para facilitar a integração do [PrimeVue 3](https://primefaces.org/primevue/) e
do [AdminLTE 3](https://adminlte.io/themes/v3/). Esta camada é
projetada para ser facilmente adicionada a qualquer projeto Nuxt 3, fornecendo um template completo e funcional para
construção de aplicações web.

Você pode consultar a documentação oficial do Nuxt 3 [aqui](https://v3.nuxtjs.org/).

O Admin LTE é baseada no Bootstrap, que já está incorporado ao css do Admin LTE. Portanto neste template temos acesso
tanto a componentes de css do PrimeFlex quanto do bootstrap.

## Requisitos

Antes de prosseguir com a instalação desta camada, certifique-se de que seu projeto Nuxt 3 esteja configurado e
funcionando corretamente. Caso ainda não tenha um projeto Nuxt 3, siga as instruções
na [documentação oficial](https://nuxt.com/docs/getting-started/introduction) para criar um novo projeto.

## Instalação

Primeiramente instale o nuxt3, mais detalhes em: https://nuxt.com/

Requisitos:

* Source dir deve estar configurado para src, veja mais detalhes em configuração abaixo

Para instalar esta camada do Nuxt 3, siga os passos abaixo:

1. Abra o terminal na raiz do seu projeto Nuxt 3.
2. Execute o comando abaixo para instalar a camada via npm:

```bash
npm i @agtm/nuxt-layer-adminlte-primeface

# Dependencia do projeto, verificar se é necessário quando carregar este layer como dependencia em vez de "linkado"
# usar -f defido a um bug do npm, verificar se já foi corrigido.  
#   - https://stackoverflow.com/questions/74003458/cannot-find-module-pinia-dist-pinia-mjs-when-using-run-dev
#   - https://github.com/vuejs/pinia/issues/1542#issuecomment-1238820465
npm i -f pinia @pinia/nuxt
npm i @pinia-plugin-persistedstate/nuxt
# Instale o primevue no seu projeto para poder utilizar componentes primevue que não foram importado no
# nuxt-layer-adminlte-primeface:
npm i primevue
```

### Configuração

No arquivo nuxt.config.js, adicione a camada no array buildModules:

```javascript
defineNuxtConfig({
  // `ssr: false` desativa o Server Side Rendering, fazendo com que o Nuxt gere uma aplicação cliente-servidor tradicional
  ssr: false,
  // `srcDir: 'src'` define o diretório de origem dos arquivos do projeto. 'src' é uma pasta personalizada para seus arquivos Nuxt
  // Obrigatório
  srcDir: 'src',
  // `extends` é usado para estender a configuração com predefinições de terceiros ou plugins. Aqui, está estendendo com `@agtm/nuxt-layer-adminlte-primeface`
  extends: ['@agtm/nuxt-layer-adminlte-primeface'],
  // `$development` é um objeto de configuração específico para o ambiente de desenvolvimento
  $development: {
    // `devtools` habilita ferramentas de desenvolvimento para depuração e análise de desempenho
    devtools: {
      // `enabled: true` ativa as ferramentas de desenvolvimento
      enabled: true,
      timeline: {
        // `enabled: true` ativa a linha do tempo nas ferramentas de desenvolvimento para visualizar eventos e desempenho
        enabled: true
      }
    },
    imports: {
      // Disable auto-imports for better code traceability
      autoImport: false
    },    
    // `vite` configura o servidor de desenvolvimento Vite utilizado pelo Nuxt
    vite: {
      server: {
        fs: {
          // `strict: false` desabilita as restrições de sistema de arquivos do Vite, permitindo carregar arquivos fora da raiz do projeto
          // Removido em produção
          strict: false
        }
      }
    }
  },
  // `build` configura opções específicas para o processo de construção do projeto
  build: {
    // `transpile` é uma lista de dependências que devem ser transpiladas pelo Babel. Utilizado para bibliotecas que não são compatíveis por padrão
    transpile: ['primevue', 'pinia-plugin-persistedstate']
  }
})
```

**Importante:** Este template está pré-configurado para utilizar o diretório src para armazenas o código fonte do
projeto, então crie a pasta src e jogue os diretótrios assets, pages, public para lá.

**Notas**
* Vite.server.fs.strict = true permite que o vite acesse arquivos fora do diretório src, por exemplo ao utilizar npm link. [Rererência aqui](https://vitejs.dev/config/server-options.html#server-fs-allow)

## Configurando seu projeto (Importante)

Para customizar seu template, habilitar funcionalidades acesse a configuração:

[Consulte aqui refêrencia completa do app.config](./docs/config.md)

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
npm dev
```

Checkout the [deployment documentation](https://v3.nuxtjs.org/docs/deployment) for more information.
