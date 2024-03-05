/**
 * **Created on 03/03/2024**
 *
 * @author André Timermann <andre@timermann.com.br>
 *
 * @file
 * module for loading composables, stores at compilation level in the project
 */
import { defineNuxtModule, addImports, createResolver } from 'nuxt/kit'

export default defineNuxtModule({
  meta: {
    name: 'admin'
  },
  setup (moduleOptions, nuxt) {
    // ATENÇÃO: Código adicionado aqui é executável a nível de compilação, use plugin para carrega código em tempo de execução
    // Mesmo no plugin, o código executado antes de carregar o menu, utilize defineMenu() para configurar menu

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
