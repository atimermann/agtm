// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  ssr: false,
  srcDir: 'src',
  devtools: { enabled: true },
  app: {
    baseURL: '/manager'
  },
  extends: ['@agtm/nuxt-layer-adminlte-primeface'],
  runtimeConfig: {
    public: {
      SOCKET_HOSTNAME: process.env.SOCKET_URL,
      SOCKET_PORT: process.env.SOCKET_PORT
    }
  },
  modules: [
    '@agtm/nuxt-tools'
  ],
  imports: {
    autoImport: false
  }
})
