import { defineNuxtModule, addImports, createResolver } from 'nuxt/kit'

export default defineNuxtModule({
  meta: {
    name: 'admin'
  },
  setup (moduleOptions, nuxt) {
    const resolver = createResolver(import.meta.url)
    console.log('===> Inicializando module Admin...')

    addImports({
      name: 'useAuthAdminStore',
      as: 'useAuthAdminStore',
      from: resolver.resolve('./stores/auth.mjs')
    })

    addImports({
      name: 'useMenuAdminStore',
      as: 'useMenuAdminStore',
      from: resolver.resolve('./stores/menu')
    })
  }
})
