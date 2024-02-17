
# Importação de arquivo

**Refs:**

* https://github.com/rollup/plugins/tree/master/packages/dynamic-import-vars#limitations

Você pode carregar arquivos da pasta assets usando da seguinte forma:

```javascript
const filePath = (await import('~/assets/adminlte/img/user1-128x128.jpg')).default
```

Ao utilizar o método import, o nuxt irá injetar automaticamente o arquivo no bundle gerado, e irá retornar o caminho
desse arquivo, utilize await pois é um métoco assincrono e dafault para converter para ESM (com CJS não é necessário).

Este método, não funciona no app.config, pois não é processado pelo Vite, para contornar este problema você deve
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
* Enquanto não é possivel carregar template no app.config.mjs, alguns atributos são perdidos em app.vue. tome cuidado
* Pesquisar uma forma de contornar isso
