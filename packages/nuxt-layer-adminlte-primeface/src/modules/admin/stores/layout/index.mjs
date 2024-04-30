/**
 * @file
 *
 * Responsible for adjusting the layout of the template according to dynamic settings, useful in Multi Tenant
 * applications, where the layout can change for each different client.
 */
import { defineStore } from 'pinia'
import { useAppConfig, ref, useHead } from '#imports'
import { kebabCase } from 'change-case'

export const useLayoutAdminStore = defineStore('layoutAdmin', () => {
  const { admin } = useAppConfig()

  // Carrega CSS do AdminLTE
  import('#assets/adminlte/css/adminlte.css')

  // TODO: Não importa a ordem, o nlap.css sempre será carregado depois por conta do tamanho, necessário então ir substituindo e organizando  progressivamente
  //  css do adminlts.css para nlap.css e de preferencir crair mais arquivos,
  import('#assets/nlap/root.css')
  import('#assets/nlap/btn.css')
  import('#assets/nlap/sidebar.css')

  // Carretga CSS do PrimeVue
  import('primevue/resources/themes/aura-light-green/theme.css')

  // Css Primeicon
  import('primeicons/primeicons.css')

  // PrimeFlex
  import('primeflex/primeflex.css')

  // TODO: Técnica para alterar o layout geral
  // Atualmente o adminlte adiciona uma classe no body e altera o css de cada elemento, possivel fazero mesmo:
  // $('body').addClass('dark-mode')}else{$('body').removeClass('dark-mode')
  // Ver use useHead abaixi
  // O Nuxt3 controla o elemento body internamente, então devemos alterarmos de outra forma:
  // https://nuxt.com/docs/api/composables/use-head
  // import { useHead } from '#imports';
  // TODO: Tratar DARK MODE AUTOMATICAMENTE
  // useHead({
  //   bodyAttrs: {
  //     class: 'dark-mode'
  //   }
  // })

  const login = ref({
    logoImage: null,
    logoLabel: admin.logoLabel
  })

  const menu = ref({
    logoImage: '',
    logoLabel: 'NLAP Control Panel'
  })

  /**
   * Configura o layout de uma vez.
   * // TODO: além de configuração de estilo, passar também outros parametros como imagem
   *
   * @param options  Parametros
   * @class
   */
  function configure (options) {
    Object.keys(options).forEach(key => {
      const cssKey = kebabCase(key)
      document.documentElement.style.setProperty(`--${cssKey}`, options[key])
    })
  }

  function loadTheme () {

  }

  function setLoginLogoImage (logoImage) {
    login.value.logoImage = logoImage
  }

  function setLoginLogoLabel (logoLabel) {
    login.value.logoLabel = logoLabel
  }

  function setMenuLogoImage (image) {
    menu.value.logoImage = image
  }

  function setMenuLogoLabel (label) {
    menu.value.logoLabel = label
  }

  // Inicializa valores se não forem definidos dentro de 100ms
  setTimeout(async () => {
    if (!menu.value.logoImage) {
      setMenuLogoImage((await import('#assets/adminlte/img/AdminLTELogo.png')).default)
    }
  }, 100)

  return {
    // Attributes
    login,
    menu,
    // Methods
    configure,
    loadTheme,
    setLoginLogoLabel,
    setLoginLogoImage,
    setMenuLogoLabel,
    setMenuLogoImage
  }
})
