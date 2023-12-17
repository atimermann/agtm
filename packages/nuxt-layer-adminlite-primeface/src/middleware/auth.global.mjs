/**
 * **Created on 16/04/2023**
 *
 * src/middleware/auth.mjs
 * @author André Timermann <andre@timermann.com.br>
 *
 * Ref: https://auth.nuxtjs.org/
 *
 */

import { defineNuxtRouteMiddleware, useAppConfig, navigateTo /* useAsyncData */ } from '#imports'
import { useAuthStore } from '../stores/auth.mjs'

export default defineNuxtRouteMiddleware(async (to, from) => {
  const appConfig = useAppConfig()

  if (!appConfig.template.login) {
    throw new Error('"appConfig.template.login" attribute not defined. Check the "app.config.ts" file')
  }

  if (!appConfig.template.login.enable && to.path === '/login') {
    return navigateTo({ path: '/' })
  }

  if (appConfig.template.login.enable) {
    const authStore = useAuthStore()

    if (to.path !== '/login' && !authStore.authenticated) {
      return navigateTo({ path: '/login' })
    }
  }

  //
  // const store = useStore()
  // const { data } = await useAsyncData('user', () => store.fetchUser())
  //
  // console.log(data)
  //

  // console.log('LOGIN HABILITADO', appConfig.template.login.enable)

  // console.log(to.path)

  // const logged = localStorage.getItem('logged')
})
