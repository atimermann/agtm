# Configuração (Personalização do template)

Temos dois tipos de configurações principais para personalizar o template e configurar seu projeto:

# RunTimeConfig

São parametros que variam em tempo de execução. Essa configuração é útil para armazenar informações que podem precisar
ser atualizadas ou alteradas sem necessidade de reconstruir toda a aplicação.

Normalmente são configurações que podem ser definidas em váriaveis de ambiente, por exemplo a URL de conexão de uma API
e podem mudar de um ambiente de desenvolvimento para um de produção.

Também podem ser utilizadas para carregar dados sensíveis como chaves de segurança

Configurações são definidas no arquivo nuxt.config.js usando as propriedades runtimeConfig.

**IMPORTANTE:** Configurações pré-definida do nuxtLayerAdmin estão localizadas em **runtimeConfig.public.template**

**Exemplo:**

```javascript
import packageJSON from './package.json'

export default defineNuxtConfig({
  runtimeConfig: {
    public: {
      // Configurações especifica do tempate 
      template: {
        version: packageJSON.version
      },
      // Exemplo de como acessar váriaveis de ambiente
      coreHostname: process.env.CORE_HOSTNAME,
      corePort: process.env.CORE_PORT,
      coreProtocol: process.env.CORE_PROTOCOL,
      coreApiBaseUrl: process.env.CORE_API_BASE_URL
    }
  }
})
```

**Nota:** Como o admin é uma aplicação SPA (sem renderização no servidor) vamos utilizar apenas o tipo "public"

## Refêrencia de configurações internas do Nuxt Layer Admin

| Propriedade | Descrição                                   | Tipo  | Padrão | Exemplo             |
|-------------|---------------------------------------------|-------|--------|---------------------|
| version     | Versão da aplicação, será exibido no rodapé | Texto |        | packageJSON.version |

# AppConfig

São parametros fixos de configuração do template e do projeto que nunca se altera depois do projeto ser compilado

Enquanto o runtimeConfig é ideal para informações que podem variar e precisam ser seguras, o appConfig é mais voltado
para a configuração estática e estrutural do aplicativo.

Você pode criar um arquivo app.config.mjs ou configurar no app.vue (depende de sua necessidade)

Para configurar o template crie um arquivo app.config.ts(mjs, cjs, js) na raiz do projeto:

**exemplo:**
app.config.mjs

```javascript
export default {
  template: {
    login: {
      enable: true
    },
    logoLabel: 'DataFrost'
  }
}
```

## Importação de arquivo

**Refs:**

* https://github.com/rollup/plugins/tree/master/packages/dynamic-import-vars#limitations

Você pode carregar arquivos da pasta assets usando da seguinte forma:

```javascript
const filePath = (await import('~/assets/adminlte/img/user1-128x128.jpg')).default
```

Ao utilizar o método import, o nuxt irá injetar automaticamente o arquivo no bundle gerado, e irá retornar o caminho
desse arquivo, utilize await pois é um métoco assincrono e dafault para converter para ESM (com CJS não é necessário).

Este método, não funciona no app.config, pois não é processado pelo Vite, para resolver este problema você pode
configurar o template da seguinte forma:

Crie um arquivo **app.vue** na raiz da aplicação:

src/app.vue:

```vue

<template>
  <NuxtLayout/>
</template>

<script setup>

  // ----------------------------------------------------------------------
  // Configuração do Template
  // ----------------------------------------------------------------------

  const appConfig = useAppConfig()

  appConfig.template = {
    // Carregando imagem dinamicamente  https://nuxt.com/docs/getting-started/assets#assets-directory
    logoPath: (await import('~/assets/img/logo.png')).default
  }

</script>

```

## Refêrencia de configurações internas do Nuxt Layer Admin

# Refêrencia

| Propriedade | Descrição                                                                  | Tipo          | Padrão     | Exemplo                                         |
|-------------|----------------------------------------------------------------------------|---------------|------------|-------------------------------------------------|
| logoPath    | Caminho da logo                                                            | Texto         |            | (await import('~/assets/img/logo.png')).default |
| logoLabel   | Texto com a logo, usado no login e no admin  (Normalmente nome do projeto) | Texto         | AdminLte 3 |                                                 |
| menu        | Configuração do menu (Ver mais abaixo)                                     | Objeto (Menu) |            |                                                 |

## Menu

| Propriedade | Descrição              | Tipo              | Padrão | Exemplo |
|-------------|------------------------|-------------------|--------|---------|
| Items       | Lista de itens do menu | Array de MenuItem |        |         |

## MenuItem

| Propriedade | Descrição                          | Tipo              | Padrão | Exemplo            |
|-------------|------------------------------------|-------------------|--------|--------------------|
| title       | Título da entrada no menu          | String            |        |                    |
| link        | Caminho destino ao clicar no menu  | String            |        | '/dashboard'       |
| iconClasses | Icone para esta entrada do menu    | Array             |        | [ 'pi', 'pi-home'] |
| subItems    | Lista de Submenu (Máximo 2 níveis) | Array de MenuItem |        |                    |


# Acessando configurações

Para acessar configurações do tipo runtimeConfig em seu projeto utilize useRuntimeConfig.

**Exemplo:**
```vue
<script setup>
    const runtimeConfig = useRuntimeConfig()    
</script>

<template>
  {{ runtimeConfig.public.version }}
</template>

```

Para acessar configurações do tipo appConfig em seu projeto utilize

**Exemplo:**

```vue
<script setup>
  import { useAppConfig } from '#imports'
  const { template } = useAppConfig()  
</script>

<template>
  {{ template.logoLabel }}
</template>

```
