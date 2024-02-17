// https://nuxt.com/docs/api/configuration/nuxt-config
import { defineNuxtConfig } from 'nuxt/config'
import packageJSON from './package.json'

export default defineNuxtConfig({
  ssr: false,
  srcDir: 'src',
  extends: ['@agtm/nuxt-layer-adminlte-primeface'],
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
  imports: {
    autoImport: false
  },
  vite: {
    logLevel: 'info'
  },
  runtimeConfig: {
    public: {
      template: {
        version: packageJSON.version
      }
    }
  }
})
