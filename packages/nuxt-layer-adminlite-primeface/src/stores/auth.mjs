/**
 * **Created on 16/12/23**
 *
 * packages/nuxt-layer-adminlite-primeface/src/stores/auth.mjs
 * @author André Timermann <andre@timermann.com.br>
 *
 * @link https://dev.to/kellskamuzu/nuxt-3-authentication-with-pinia-3bj7
 * @link https://prazdevs.github.io/pinia-plugin-persistedstate/frameworks/nuxt-3.html
 *
 * TODO: Implementar: https://www.keycloak.org/docs/latest/securing_apps/#_javascript_adapter
 *
 */

import { defineStore } from 'pinia'
import { useFetch } from '#imports'
import { jwtDecode } from 'jwt-decode'

export const useAuthStore = defineStore('auth', {
  state: () => {
    return {
      authenticated: false,
      accessToken: null,
      decodedToken: null
    }
  },
  actions: {
    async login (username, password) {
      const { data, error } = await useFetch('http://localhost:3001/authenticate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: { username, password }
      })

      if (data.value) {
        this.authenticated = true
        this.accessToken = data.value.access_token
        this.decodedToken = jwtDecode(this.accessToken)
        return {
          auth: true
        }
      } else if (error.value) {
        this.authenticated = false
        this.accessToken = null
        this.decodedToken = null

        return {
          auth: false,
          message: error.value.data.message
        }
      }
    },
    logout () {
      this.authenticated = false
      this.accessToken = null
      this.decodedToken = null
    }
  },
  persist: true
})
