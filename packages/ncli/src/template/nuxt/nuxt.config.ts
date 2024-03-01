// https://nuxt.com/docs/api/configuration/nuxt-config
// noinspection JSUnusedGlobalSymbols
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
    logLevel: 'info',
    define: {
      // https://masteringnuxt.com/blog/7-new-features-in-nuxt-3-9
      // Turning this on will increase your bundle size, but it’s really useful for tracking down those pesky hydration errors.
      __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: false
    }
  },
  runtimeConfig: {
    public: {
      template: {
        version: packageJSON.version
      },
      server: {
        host: ''
      }
    }
  }
})
