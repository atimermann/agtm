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

import 'primevue/resources/themes/aura-light-green/theme.css'

// TODO: Nova versão do Primevue, alterou a forma de carregar os temas, verificar necessidade de manter customização abaixo:
// import '../assets/primevue-theme.css'
import 'primeicons/primeicons.css'
import 'primeflex/primeflex.css'

import '../assets/adminlte/css/adminlte.css'

// Módulos carregados

// TODO: Removido todos os componentes, importar diretamente no componente que vai utilizar

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.use(PrimeVue, {
    // ripple: true, // Ripple é uma animação opcional para os componentes suportados, como botões.
    locale: pt,
    unstyled: false
  })
  nuxtApp.vueApp.use(ToastService)
  nuxtApp.vueApp.use(ConfirmationService)

  nuxtApp.vueApp.directive('tooltip', Tooltip)
})
