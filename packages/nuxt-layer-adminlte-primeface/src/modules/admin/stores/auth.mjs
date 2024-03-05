/**
 * **Created on 16/12/23**
 *
 * @file
 * Provides authentication management for admin users in a Nuxt application using Pinia store.
 * This module handles authentication processes such as login, logout, and role-based access control.
 * It relies on external authentication services for token issuance and validation.
 *
 *
 * @author André Timermann <andre@timermann.com.br>
 *
 * - https://dev.to/kellskamuzu/nuxt-3-authentication-with-pinia-3bj7
 * - https://prazdevs.github.io/pinia-plugin-persistedstate/frameworks/nuxt-3.html
 *
 * TODO: Implementar: https://www.keycloak.org/docs/latest/securing_apps/#_javascript_adapter
 */

/**
 * @typedef {import('pinia').StoreDefinition} StoreDefinition
 *
 * Defines the structure of the response object from authentication-related operations.
 *
 * @typedef {object} AuthResponse
 * @property {boolean} success    - Indicates whether the operation was successful.
 * @property {string}  status     - The status or error code of the operation.
 * @property {string}  [message]  - Optional message providing more details about the operation result.
 */

/**
 * Defines the structure of the response object used in authentication operations.
 *
 * @typedef {object} Response
 * @property {object}            data    - The payload returned from the authentication server. May contain tokens, user information, or error details.
 * @property {{ value: string }} status  - The status of the response, indicating success or failure.
 * @property {?object}           error   - Optional error object containing error details. May have a `message` and additional error information.
 */

import { defineStore } from 'pinia'
import { jwtDecode } from 'jwt-decode'
import { useAppConfig, useFetch, useRuntimeConfig } from '#imports'
import { get } from 'lodash-es'

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
    /**
     * Attempts to authenticate a user with the provided username and password.
     * On success, updates the store state with the user's authentication tokens and roles.
     *
     * @param  {string}       username  - The username for authentication.
     * @param  {string}       password  - The password for authentication.
     *
     * @throws {Error} Throws an error if authentication configuration is not properly set.
     *
     * @return {AuthResponse}           An object indicating the success or failure of the operation.
     */
    async authenticate (username, password) {
      const runtimeConfig = useRuntimeConfig()
      const appConfig = useAppConfig()
      const authConfig = runtimeConfig.public.admin.auth

      if (!appConfig.admin.auth.enabled) {
        throw new Error('Authentication module is not enabled. Enabled in "app Config.admin.auth.enabled"')
      }

      if (!authConfig.url) {
        throw new Error('Authentication server URL not defined!  The URL for the authentication server is missing or not ' +
          'set in the configuration. Please define the \'NUXT_PUBLIC_ADMIN_AUTH_URL\' in the configuration ' +
          'settings to proceed.')
      }
      if (!authConfig.clientId) {
        throw new Error('ClientId not defined!  The clientID is missing or not set in the configuration. Please define ' +
          'the \'NUXT_PUBLIC_ADMIN_AUTH_CLIENT_ID\' in the configuration settings to proceed.')
      }

      const requestBody = new URLSearchParams()
      requestBody.append('username', username)
      requestBody.append('password', password)
      requestBody.append('client_id', authConfig.clientId)
      requestBody.append('grant_type', 'password')

      const response = await useFetch(authConfig.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: requestBody
      })

      if (response.status.value !== 'success') {
        return handleErrors(this, response)
      }

      if (response.status.value === 'success') {
        return handleAuthentication(this, authConfig, response)
      }
    },
    logout () {
      this.authenticated = false
      this.accessToken = null
      this.decodedToken = null
      this.refreshToken = null
    }
  },
  persist: {
    storage: localStorage
  }
})

/**
 * Handles errors received during authentication attempts, updating the store state accordingly.
 *
 * @param  {StoreDefinition} store     - The current store instance for updating authentication state.
 * @param  {Response}        response  - The response object containing error details.
 *
 * @return {AuthResponse}              An object indicating the success or failure of the operation.
 */
function handleErrors (store, { data, status, error }) {
  if (error.value) {
    store.authenticated = false
    store.accessToken = null
    store.decodedToken = null

    return {
      success: false,
      status: status.value,
      message: error.value.data
        ? error.value.data?.error_description
        : error.value.message
    }
  } else {
    return {
      success: false,
      status: status.value,
      message: data.value
    }
  }
}

/**
 * Processes successful authentication responses, updating the store with token information and user roles.
 *
 * @param  {StoreDefinition} store       - The store instance to update.
 * @param  {object}          authConfig  - Authentication configuration settings.
 * @param  {Response}        response    - The successful authentication response data.
 *
 * @return {AuthResponse}                An object indicating the success of the authentication process.
 */
function handleAuthentication (store, authConfig, { data }) {
  const decodedToken = decodeToken(data.value.access_token)

  if (!validateAuthenticationRoles(store, authConfig, decodedToken)) {
    return {
      success: false,
      status: 'AUTH_ROLE_ERROR',
      message: 'User is not authorized'
    }
  }

  store.authenticated = true
  store.accessToken = data.value.access_token
  store.decodedToken = decodedToken
  store.refreshToken = data.value.refresh_token
  store.decodedRefreshToken = decodeToken(store.refreshToken)
  store.tokenType = data.value.token_type
  store.notBeforePolicy = data.value['not-before-policy']
  store.sessionState = data.value.session_state
  store.scope = data.value.scope

  return {
    success: true
  }
}

/**
 * Decodes a provided JWT token. This function attempts to decode the token using the `jwtDecode` library.
 * On successful decoding, it returns the decoded payload of the token. If decoding fails, for example,
 * due to a malformed or expired token, it logs the error to the console and returns an object
 * indicating the failure of the operation.
 *
 * @param  {string} token  - The JWT token to be decoded.
 * @return {object}        The decoded token payload if the operation is successful. Otherwise,
 *                         returns an object containing `success`, `status`, and `message` indicating the error occurred.
 */
function decodeToken (token) {
  try {
    return jwtDecode(token)
  } catch (error) {
    console.error('Failed to decode token:', error)
    return {
      success: false,
      status: 'TOKEN_DECODE_ERROR',
      message: 'Failed to decode token.'
    }
  }
}

/**
 * Validates if the authenticated user has the required roles for access.
 *
 * @param  {StoreDefinition} store         - The current store instance for updating authentication state.
 * @param  {object}          authConfig    - The authentication configuration, including role settings.
 * @param  {object}          decodedToken  - The decoded JWT token containing the user's roles.
 *
 * @throws {Error} Throws an error if role validation configuration is missing or incorrect.
 *
 * @return {boolean}                       True if the user has the required roles, false otherwise.
 */
function validateAuthenticationRoles (store, authConfig, decodedToken) {
  if (!authConfig.role.enabled) return true

  if (!authConfig.role.path) throw new Error('The \'authConfig.role.path\' must be defined.')
  if (!authConfig.role.roles) throw new Error('The \'authConfig.role.roles\' must be defined.')

  const authorizedRoles = (Array.isArray(authConfig.role.roles))
    ? authConfig.role.roles
    : authConfig.role.roles.split(',')

  const userRoles = get(decodedToken, authConfig.role.path)

  store.userRoles = userRoles

  return userRoles.some(role => authorizedRoles.includes(role))
}
