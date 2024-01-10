import { defineNuxtConfig } from 'nuxt/config'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

// TODO: Alterar quando for corrigido
// https://nuxt.com/docs/guide/going-further/layers#relative-paths-and-aliases
const currentDir = dirname(fileURLToPath(import.meta.url))

// https://v3.nuxtjs.org/api/configuration/nuxt.config
export default defineNuxtConfig({
  $development: {
    devtools: {
      enabled: true,
      timeline: {
        enabled: true
      }
    },
    vite: {
      server: {
        fs: {
          strict: false
        }
      }
    }
  },
  ssr: false,
  srcDir: 'src',
  app: {
    head: {
      link: [
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css?family=Source+Sans+Pro:300,400,400i,700&display=fallback'
        }
      ]
    }
  },
  css: [
    // ========================
    //  PRIME CONFIG
    // ========================

    // TODO: ao usar npm run link, o nuxt não encontra mais o caminho, necessário especificar manualmente, verificar
    //    como funciona sem o link e se tem alguma forma de carregar q não tenha este problema

    // 'primevue/resources/themes/bootstrap4-light-blue/theme.css', (Não usar direto)
    join(currentDir, './src/assets/theme.css'),

    // TODO: Esta importação é problemática, foi carregado diretamente em src/plugins/primevue.mjs
    // '~/assets/theme.css', // (Customizado) Este arquivo foi gerado em https://designer.primevue.org/#/ e modificado
    // join(currentDir, './node_modules/primevue/resources/primevue.min.css'),
    // join(currentDir, './node_modules/primeicons/primeicons.css'),
    // join(currentDir, './node_modules/primeflex/primeflex.css'),
    // 'primevue/resources/primevue.min.css',
    // 'primeicons/primeicons.css',
    // 'primeflex/primeflex.css',

    // ========================
    //  ADMIN LTE CONFIG
    // ========================
    join(currentDir, './src/assets/adminlte/css/adminlte.css')

    // ========================
    // fortawesome
    // ========================
    // join(currentDir, './node_modules/@fortawesome/fontawesome-svg-core/styles.css')
    // '@fortawesome/fontawesome-svg-core/styles.css'

  ],
  build: {
    transpile: ['primevue', 'pinia-plugin-persistedstate']
  },
  vite: {
    resolve: {
      alias: {
        '@assets': join(currentDir, 'src', 'assets')
      }
    }
  },
  modules: [
    '@agtm/nuxt-tools',
    '@pinia/nuxt',
    '@pinia-plugin-persistedstate/nuxt'
  ]
})
