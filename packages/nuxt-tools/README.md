<!--
Get your module up and running quickly.

Find and replace all on all files (CMD+SHIFT+F):
- Name: My Module
- Package name: my-module
- Description: My new Nuxt module
-->

# @agtm/Nuxt Tools

<!--
[![npm version][npm-version-src]][npm-version-href]
[![npm downloads][npm-downloads-src]][npm-downloads-href]
[![License][license-src]][license-href]
[![Nuxt][nuxt-src]][nuxt-href]
-->
Module with useful tools for Nuxt projects
<!--
[//]: # (- [✨ &nbsp;Release Notes]&#40;/CHANGELOG.md&#41;)
-->
<!--
[//]: # ( - [🏀 Online playground]&#40;https://stackblitz.com/github/your-org/my-module?file=playground%2Fapp.vue&#41; )

[//]: # ( - [📖 &nbsp;Documentation]&#40;https://example.com&#41;)
-->

## Features

<!-- Highlight some of the features your module provide here -->

- ⛰ getEnvConfig

## Quick Setup

1. Add `@agtm/nuxt-tools` dependency to your project

```bash
# Using npm
npm install --save-dev @agtm/nuxt-tools
npm install @agtm/nuxt-tools
```

2. Add `@agtm/nuxt-tools/module` to the `modules` section of `nuxt.config.ts`

```js
export default defineNuxtConfig({
  modules: [
    '@agtm/nuxt-tools'
  ]
})
```

That's it! You can now use My Module in your Nuxt app ✨

## Guia de Uso: NuxtTool

Exemplo de uso:

```vue

<script setup>

  import { useNuxtTools } from '#imports'

  const {getEnvConfig} = useNuxtTools

</script>


```

## Guia de Uso: SocketTools

### connect

Conecta automaticamente no servidor socket à partir das varaiveis de ambiente:

```dotenv
NUXT_PUBLIC_SOCKET_HTTPS=true
NUXT_PUBLIC_SOCKET_HOSTNAME=localhost
NUXT_PUBLIC_SOCKET_PORT=3001
```

ATENÇÃO: Não esqueça de definir essas váriaveis no nuxt_config para o nuxt carrega-las:

```javascript
runtimeConfig: {
  public: {
    socketHttps: false,
    socketHostname: '',
    socketPort: ''
  }
}
```

Exemplo de Uso:
```vue

<script setup>

  import { io } from 'socket.io-client'
  import { useSocketTools } from '#imports'
  
  const socket = useSocketTools.connect(io, '/jobs')

</script>


```

## Guia de Uso: useTools

### getEnvConfig

Carrega um atributo público definido com `runtimeconfig` e definido com uma variável de ambiente, validando se foi definido.

- **Parâmetros:**
  - `attributeName` (string): Nome do atributo a ser carregado e validado.
  - `required` (boolean): Se é requerido. Padrão é `true`.
- **Retorno:** Promise<void>.

### calculateEta

Calcula o Tempo Estimado de Chegada (ETA) para atingir 100% de progresso.

- **Parâmetros:**
  - `startAt` (Date|string): Data/hora de início do processo. Aceita um objeto Date do JavaScript ou uma string que pode ser convertida em Date.
  - `progress` (number): Porcentagem atual de progresso, deve estar entre 0 e 100 (exclusivo).
- **Retorno:** string|null. Retorna o tempo estimado restante para atingir 100% de progresso de forma legível.
- **Exceções:** Lança um erro se o progresso não estiver entre 0 e 100 (exclusivo).

### encryptText

Criptografa um texto dado usando um algoritmo de hash especificado.

- **Parâmetros:**
  - `text` (string): O texto a ser criptografado.
  - `algorithm` (string): O algoritmo de hash a ser usado. Padrão é 'SHA-256'.
- **Retorno:** Promise<string>. O texto criptografado como uma string hexadecimal.
- **Exceções:** Lançará um erro se o algoritmo de hash não for suportado.

```javascript
const encryptedText = await encryptText('hello');
console.log(encryptedText);  // Saídas do texto criptografado em formato hexadecimal.
```


## Development

Reference: https://nuxt.com/docs/guide/going-further/modules

```bash
# Install dependencies
npm install

# Generate type stubs
npm run dev:prepare

# Develop with the playground
npm run dev

# Build the playground
npm run dev:build

# Run ESLint
npm run lint

# Run Vitest
npm run test
npm run test:watch

# Release new version
npm run release
```

<!-- Badges -->

[npm-version-src]: https://img.shields.io/npm/v/my-module/latest.svg?style=flat&colorA=18181B&colorB=28CF8D

[npm-version-href]: https://npmjs.com/package/my-module

[npm-downloads-src]: https://img.shields.io/npm/dm/my-module.svg?style=flat&colorA=18181B&colorB=28CF8D

[npm-downloads-href]: https://npmjs.com/package/my-module

[license-src]: https://img.shields.io/npm/l/my-module.svg?style=flat&colorA=18181B&colorB=28CF8D

[license-href]: https://npmjs.com/package/my-module

[nuxt-src]: https://img.shields.io/badge/Nuxt-18181B?logo=nuxt.js

[nuxt-href]: https://nuxt.com
