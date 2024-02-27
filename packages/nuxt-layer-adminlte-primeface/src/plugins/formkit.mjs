/**
 * **Created on 27/02/2024*
 *
 * @author André Timermann <andre@timermann.com.br>
 * @link https://formkit.com/getting-started/installation
 *
 *   Install the version for Vue and not for nuxt (version for nuxt does not work well with layer)
 */

import { defineNuxtPlugin } from '#app'
import { plugin, defaultConfig } from '@formkit/vue'
import { pt } from '@formkit/i18n'

export default defineNuxtPlugin(nuxtApp => {
  nuxtApp.vueApp.use(plugin, defaultConfig({
    theme: 'genesis',
    locales: { pt },
    locale: 'pt'
    // inputs: primeInputs
  }))
})
