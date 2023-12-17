/**
 * **Created on 16/12/23**
 *
 * packages/nuxt-layer-adminlite-primeface/src/stores/auth.mjs
 * @author André Timermann <andre@timermann.com.br>
 *
 * @link https://dev.to/kellskamuzu/nuxt-3-authentication-with-pinia-3bj7
 * @link https://prazdevs.github.io/pinia-plugin-persistedstate/frameworks/nuxt-3.html
 *
 */

import { defineStore } from 'pinia'

export const useAuthStore = defineStore('auth', {
  state: () => {
    return {
      authenticated: false
    }
  },
  persist: true
})
