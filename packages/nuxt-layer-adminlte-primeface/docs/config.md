# Configuração (Personalização do template)

Temos dois tipos de configurações principais para personalizar o template e configurar seu projeto:

# RunTimeConfig

São parametros que variam em tempo de execução. Essa configuração é útil para armazenar informações que podem precisar
ser atualizadas ou alteradas sem necessidade de reconstruir toda a aplicação.

Normalmente são configurações que podem ser definidas em váriaveis de ambiente, por exemplo a URL de conexão de uma API 
podem mudar de um ambiente de desenvolvimento para um de produção.

Também podem ser utilizadas para carregar dados sensíveis como chaves de segurança.

**IMPORTANTE:** 
* Configurações pré-definida do nuxtLayerAdmin estão localizadas em **runtimeConfig.public.template**
* Toda alteração no runtimeConfig exige reinicio da aplicação para que as alterações sejam aplicadas

**Exemplo:**

**nuxt.config.ts:**
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

## Váriaveis de ambiente

Parâmetros especifico de sua aplicação não precisam ser definidas no runtimeConfig do arquivo **nuxt.config.ts**

Você pode acessar diretamente utilizando o padrão de carregamento de váriaveis de ambiente do Nuxt:

Por exemplo, a variável de ambiente 

  **NUXT_PUBLIC_TEMPLATE_AUTH_URL**

Pode ser acessada como:

```vue
<script setup>
  const runtimeConfig = useRuntimeConfig()
  alert(runtimeConfig.public.template.auth.url)  
</script>
<template>
  {{ runtimeConfig.public.template.auth.url }}
</template>
```

**NOTAS:** 
  * Lembrando que deve ser public para que seja acessivel do lado cliente
  * .env é suportado por padrão pelo nuxt, porém não é recomendável em ambiente de contêiner

## Refêrencia de configurações internas do Nuxt Layer Admin

| Propriedade | Descrição                                   | Tipo  | Padrão | Exemplo             |
|-------------|---------------------------------------------|-------|--------|---------------------|
| version     | Versão da aplicação, será exibido no rodapé | Texto |        | packageJSON.version |

# AppConfig

São parametros fixos do template e do projeto que nunca se alteram depois do projeto ser compilado.

Enquanto o runtimeConfig é ideal para informações que podem variar e precisam ser seguras, o appConfig é mais voltado
para a configuração estática e estrutural do aplicativo.

Você dev criar um arquivo app.config.mjs ou configurar no app.vue (depende de sua necessidade)

Crie um arquivo app.config.ts(mjs, cjs, js) na raiz do projeto:

**exemplo:**
app.config.mjs

```javascript
export default {
  template: {
    login: {
      enable: true
    },
    logoLabel: 'MyProjectName'
  }
}
```
## Refêrencia de configurações internas do Nuxt Layer Admin

# Refêrencia

| Propriedade | Descrição                                                                  | Tipo          | Padrão     | Exemplo                                         |
|-------------|----------------------------------------------------------------------------|---------------|------------|-------------------------------------------------|
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

## Importação de arquivo na configuração

**Refs:**
* https://github.com/rollup/plugins/tree/master/packages/dynamic-import-vars#limitations

Algumas parâmetros podem receber conteúdo de arquivos, na qual desejamos importar.

Você pode carregar arquivos da pasta **assets** usando da seguinte forma:

```javascript
const filePath = (await import('~/assets/adminlte/img/user1-128x128.jpg')).default
```

Ao utilizar o método import, o nuxt irá injetar automaticamente o arquivo no bundle gerado, e irá retornar o caminho
desse arquivo, utilize await pois é um métoco assincrono e dafault para converter para ESM (com CJS não é necessário).

Este método, **não** funciona no **app.config**, pois não é processado pelo Vite, para contornar este problema você deve
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

**MUITO IMPORTANTE:**

* Neste caso você deve criar obrigatóriamente dois arquivos de configuração:
  * app.config.mjs e app.vue
* app.vue carrega apenas parametros dinamicos como uma imagem ou outro valor dinamico
* app.vue é carregado DEPOIS da inicialização do template, portanto algumas configurações importantes serão ignoradas,
  como por exemplo login.enabled que é utilizado internamente em um middleware.
* Enquanto não é possivel carregar template no app.config.mjs, alguns atributos são perdidos/ignorados em app.vue. tome cuidado
* Pesquisar uma forma de contornar isso
