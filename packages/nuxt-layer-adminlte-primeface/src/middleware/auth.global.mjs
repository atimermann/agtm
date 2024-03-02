/**
 * **Created on 16/04/2023**
 *
 * src/middleware/auth.mjs
 *
 * @author André Timermann <andre@timermann.com.br>
 *
 * Ref: https://auth.nuxtjs.org/
 */

import { useAuthStore } from '../stores/auth.mjs'
import { defineNuxtRouteMiddleware, useAppConfig, navigateTo, useRouter } from '#imports'

export default defineNuxtRouteMiddleware(async (to, from, x) => {
  const appConfig = useAppConfig()

  if (!appConfig.admin.auth) {
    throw new Error('"appConfig.admin.auth" attribute not defined. Check the "app.config.ts" file')
  }
  if (!appConfig.admin.auth.enabled && to.path === '/login') {
    return navigateTo({ path: '/' })
  }

  if (appConfig.admin.auth.enabled) {
    if (to.meta.auth === undefined) {
      const routes = useRouter().getRoutes()
      const routeExists = routes.some(route => route.path === to.path || route.name === to.name)
      if (!routeExists) { return }

      throw new Error('Attribute "auth" is mandatory in definePageMeta, must be "true" or "false"')
    }

    if (to.meta.auth) {
      const authStore = useAuthStore()

      if (to.path !== '/login' && !authStore.authenticated) {
        sessionStorage.setItem('redirectAfterLogin', to.fullPath)
        return navigateTo({ path: '/login' })
      }
    }
  }

  //
  // const store = useStore()
  // const { data } = await useAsyncData('user', () => store.fetchUser())
  //
  // console.log(data)
  //

  // console.log('LOGIN HABILITADO', appConfig.admin.auth.enable)

  // console.log(to.path)

  // const logged = localStorage.getItem('logged')
})
