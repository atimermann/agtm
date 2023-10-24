import { defineNuxtModule, createResolver, addComponent } from '@nuxt/kit'

// Module options TypeScript interface definition

export default defineNuxtModule({
  meta: {
    name: '@agtm/nf-manager-web',
    configKey: '@agtmNfManagerWeb'
  },
  // Default configuration options of the Nuxt module
  defaults: {},
  setup (options, nuxt) {
    const resolver = createResolver(import.meta.url)

    addComponent({
      name: 'NfManagerJobList', // name of the component to be used in vue templates
      filePath: resolver.resolve('runtime/components/JobList.vue')
    })

    addComponent({
      name: 'NfManagerJobPanel', // name of the component to be used in vue templates
      filePath: resolver.resolve('runtime/components/JobPanel.vue')
    })
  }
})
