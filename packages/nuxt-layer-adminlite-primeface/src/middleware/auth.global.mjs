/**
 * **Created on 16/04/2023**
 *
 * src/middleware/auth.mjs
 * @author André Timermann <andre@timermann.com.br>
 *
 */

import { defineNuxtRouteMiddleware, navigateTo } from '#imports'

export default defineNuxtRouteMiddleware((to, from) => {
  const logged = localStorage.getItem('logged')

  if (to.path !== '/login' && logged !== 'logged') {
    return navigateTo({ path: '/login' })
  }
})
