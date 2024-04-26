/**
 * @file
 *
 * Responsible for adjusting the layout of the template according to dynamic settings, useful in Multi Tenant
 * applications, where the layout can change for each different client.
 */
import { defineStore } from 'pinia'
import { useAppConfig, ref } from '#imports'

export const useLayoutAdminStore = defineStore('layoutAdmin', () => {
  const { admin } = useAppConfig()

  const login = ref({
    logoImage: null,
    logoLabel: admin.logoLabel
  })

  function setLoginLogoImage (logoImage) {
    login.value.logoImage = logoImage
  }

  function setLoginLogoLabel (logoLabel) {
    login.value.logoLabel = logoLabel
  }

  return {
    login,
    setLoginLogoImage,
    setLoginLogoLabel
  }
})
