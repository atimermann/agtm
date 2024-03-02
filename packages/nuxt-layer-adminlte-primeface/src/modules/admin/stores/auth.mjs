/**
 * **Created on 16/12/23**
 *
 * packages/nuxt-layer-adminlite-primeface/src/stores/auth.mjs
 *
 * @author André Timermann <andre@timermann.com.br>
 *
 * - https://dev.to/kellskamuzu/nuxt-3-authentication-with-pinia-3bj7
 * - https://prazdevs.github.io/pinia-plugin-persistedstate/frameworks/nuxt-3.html
 *
 * TODO: Implementar: https://www.keycloak.org/docs/latest/securing_apps/#_javascript_adapter
 */

import { defineStore } from 'pinia'
import { jwtDecode } from 'jwt-decode'
import { useAppConfig, useFetch, useRuntimeConfig } from '#imports'

export const useAuthAdminStore = defineStore('authAdmin', {
  state: () => ({
    /**
     * Indicates if the user is currently authenticated.
     *
     * @type {boolean}
     */
    authenticated: false,

    /**
     * The JWT access token received from the authentication server.
     *
     * @type {?string}
     */
    accessToken: null,

    /**
     * The decoded JWT access token containing user and session information.
     *
     * @type {?object}
     */
    decodedToken: null,

    /**
     * Time in seconds when the access token will expire.
     *
     * @type {?number}
     */
    expiresIn: null,

    /**
     * The refresh token used to obtain new access tokens.
     *
     * @type {?string}
     */
    refreshToken: null,

    /**
     * The decoded JWT refresh token containing user and session information for refreshing the access token.
     *
     * @type {?object}
     */
    decodedRefreshToken: null,

    /**
     * Time in seconds when the refresh token will expire.
     *
     * @type {?number}
     */
    refreshExpiresIn: null,

    /**
     * The not-before policy timestamp indicating the time before which the token should not be accepted.
     *
     * @type {?number}
     */
    notBeforePolicy: null,

    /**
     * Represents the state of the user's session on the authentication server.
     *
     * @type {?string}
     */
    sessionState: null,

    /**
     * The scope of the access token indicating which permissions were granted.
     *
     * @type {?string}
     */
    scope: null
  }),
  actions: {
    async authenticate (username, password) {
      const runtimeConfig = useRuntimeConfig()
      const appConfig = useAppConfig()
      const authUrl = runtimeConfig.public.admin.auth.url
      const clientId = runtimeConfig.public.admin.auth.clientId

      if (!appConfig.admin.auth.enabled) {
        throw new Error('Authentication module is not enabled. Enabled in "app Config.admin.auth.enabled"')
      }

      if (!authUrl) {
        throw new Error('Authentication server URL not defined!  The URL for the authentication server is missing or not ' +
          'set in the configuration. Please define the \'NUXT_PUBLIC_ADMIN_AUTH_URL\' in the configuration ' +
          'settings to proceed.')
      }
      if (!clientId) {
        throw new Error('ClientId not defined!  The clientID is missing or not set in the configuration. Please define ' +
          'the \'NUXT_PUBLIC_ADMIN_AUTH_CLIENT_ID\' in the configuration settings to proceed.')
      }

      const requestBody = new URLSearchParams()
      requestBody.append('client_id', clientId)
      requestBody.append('username', username)
      requestBody.append('password', password)
      requestBody.append('grant_type', 'password')

      const { data, status, error } = await useFetch(authUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: requestBody
      })

      if (status.value === 'success') {
        this.authenticated = true
        this.accessToken = data.value.access_token
        this.decodedToken = jwtDecode(this.accessToken)
        this.refreshToken = data.value.refresh_token
        this.decodedRefreshToken = jwtDecode(this.refreshToken)
        this.tokenType = data.value.token_type
        this.notBeforePolicy = data.value['not-before-policy']
        this.sessionState = data.value.session_state
        this.scope = data.value.scope

        return {
          success: true
        }
      } else {
        if (error.value) {
          this.authenticated = false
          this.accessToken = null
          this.decodedToken = null

          return {
            success: false,
            status: status.value,
            auth: false,
            message: error.value.data
              ? error.value.data
              : error.value.message
          }
        } else {
          return {
            success: false,
            status: status.value,
            data: data.value
          }
        }
      }
    },
    logout () {
      this.authenticated = false
      this.accessToken = null
      this.decodedToken = null
      this.refreshToken = null
      this.accessToken = null
    }
  },
  persist: {
    storage: localStorage
  }
})
