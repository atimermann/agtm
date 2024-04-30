/**
 * **Created on 31/03/2023**
 *
 * src/plugins/primevue.mjs
 *
 * @author André Timermann <andre@timermann.com.br>
 *
 * TODO: Reduzir ao máximo a quantidade de componentes Prime carregado automaticamente por aqui, é preferível importar
 *  diretamente no componente
 */

import PrimeVue from 'primevue/config'
import Tooltip from 'primevue/tooltip'
import ToastService from 'primevue/toastservice'
import ConfirmationService from 'primevue/confirmationservice'

import { pt } from '../locale/locale.mjs'
import { defineNuxtPlugin } from '#app'

// Note: CSS loaded by "useLayoutAdminStore"
export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.use(PrimeVue, {
    // ripple: true, // Ripple é uma animação opcional para os componentes suportados, como botões.
    locale: pt,
    unstyled: false,
    pt: {
      button: {
        root: () => ({
          class: ['btn', 'btn-block', 'btn-primary']
        })
      }
    }
  })
  nuxtApp.vueApp.use(ToastService)
  nuxtApp.vueApp.use(ConfirmationService)
  nuxtApp.vueApp.directive('tooltip', Tooltip)
})
