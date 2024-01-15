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
import { useFetch, useRuntimeConfig } from '#imports'
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
      const runtimeConfig = useRuntimeConfig()
      const authUrl = runtimeConfig.public.template.auth.url

      if (!authUrl) {
        return {
          auth: false,
          message: 'Authentication server URL not defined!  The URL for the authentication server is missing or not set in the configuration. Please define the \'NUXT_PUBLIC_TEMPLATE_AUTH_URL\' in the configuration settings to proceed.'
        }
      }

      const { data, error } = await useFetch(authUrl, {
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
          message: error.value.data
            ? error.value.data.message()
            : error.value.message
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
