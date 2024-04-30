/**
 * @file
 *
 * Responsible for adjusting the layout of the template according to dynamic settings, useful in Multi Tenant
 * applications, where the layout can change for each different client.
 */
import { defineStore } from 'pinia'
import { useAppConfig, ref, useHead } from '#imports'

export const useLayoutAdminStore = defineStore('layoutAdmin', () => {
  const { admin } = useAppConfig()

  // TODO: Técnica para alterar o layout geral
  // Atualmente o adminlte adiciona uma classe no body e altera o css de cada elemento, possivel fazero mesmo:
  // $('body').addClass('dark-mode')}else{$('body').removeClass('dark-mode')
  // Ver use useHead abaixi

  // Carrega CSS do AdminLTE
  import('#assets/adminlte/css/adminlte.css')

  // Carretga CSS do PrimeVue
  import('primevue/resources/themes/aura-light-green/theme.css')

  // Css Primeicon
  import('primeicons/primeicons.css')

  // PrimeFlex
  import('primeflex/primeflex.css')

  // O Nuxt3 controla o elemento body internamente, então devemos alterarmos de outra forma:
  // https://nuxt.com/docs/api/composables/use-head
  // import { useHead } from '#imports';
  // TODO: Tratar DARK MODE AUTOMATICAMENTE
  useHead({
    bodyAttrs: {
      class: 'dark-mode'
    }
  })

  const login = ref({
    logoImage: null,
    logoLabel: admin.logoLabel
  })

  /**
   * Configura o layout de uma vez.
   *
   * @param options Parametros
   * @class
   */
  function Configure (options) {

  }

  function loadTheme () {

  }

  function setLoginLogoImage (logoImage) {
    login.value.logoImage = logoImage
  }

  function setLoginLogoLabel (logoLabel) {
    login.value.logoLabel = logoLabel
  }

  return {
    login,
    setLoginLogoImage,
    setLoginLogoLabel,
    loadTheme
  }
})
