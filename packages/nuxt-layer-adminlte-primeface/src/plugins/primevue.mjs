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

import 'primevue/resources/primevue.min.css'
import 'primeicons/primeicons.css'
import 'primeflex/primeflex.css'

import '../assets/adminlte/css/adminlte.css'
import '../assets/prime-vue-theme.css'

// Módulos carregados

// TODO: Removido todos os componentes, importar diretamente no componente que vai utilizar

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.use(PrimeVue, { ripple: true, locale: pt })
  nuxtApp.vueApp.use(ToastService)
  nuxtApp.vueApp.use(ConfirmationService)

  nuxtApp.vueApp.directive('tooltip', Tooltip)
})
