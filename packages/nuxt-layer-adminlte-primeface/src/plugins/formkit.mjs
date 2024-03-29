/**
 * **Created on 27/02/2024*
 *
 * @author André Timermann <andre@timermann.com.br>
 * https://formkit.com/getting-started/installation
 *
 *   Install the version for Vue and not for nuxt (version for nuxt does not work well with layer)
 */

import { defineNuxtPlugin } from '#app'
import { plugin, defaultConfig, createInput } from '@formkit/vue'
import { pt } from '@formkit/i18n'

/*
 * Nuxt Layer Inputs:
 *  - https://formkit.com/guides/create-a-custom-input#registration
 *  - https://formkit.com/api-reference/context
 */
import autocomplete from '../inputs/autocomplete.vue'
import taglist from '../inputs/taglist.vue'

export default defineNuxtPlugin(nuxtApp => {
  nuxtApp.vueApp.use(plugin, defaultConfig({
    theme: 'genesis',
    locales: { pt },
    locale: 'pt',
    inputs: {
      // Keep in alphabetical order
      autocomplete: createInput(autocomplete, {
        props: ['search', 'getItem', 'output', 'valueProp', 'labelProp', 'onChange']
      }),
      taglist: createInput(taglist)
    }
  }))
})
