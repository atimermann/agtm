/**
 * **Created on 05/03/24**
 *
 * @file
 * Manages a socket connection to the server.
 *
 * This module provides functionality to connect to a Socket.io server
 * and cache the connection for reuse. It also extends the socket client
 * with a method to emit messages and wait for a response with support
 * for connection waiting and timeout.
 *
 * TODO: Implement https://www.npmjs.com/package/vuejs3-logger + GRAYLOG
 *
 * @author André Timermann <andre@timermann.com.br>
 */

import { io as Client } from 'socket.io-client'
import jsSHA from 'jssha'
import prettyBytes from 'pretty-bytes'
import { watch, ref, useRuntimeConfig } from '#imports'

/**
 * Cache for storing active socket connections
 *
 * @type {{}}
 */
const connectionsCache = {}
const requestCache = {}
const bindCache = {}
let initialized = false
let config
let serverHost
let socketTimeout

/**
 * Represents the meaning of an unbound state
 *
 * @type {symbol}
 */
const notLoaded = Symbol('notLoaded')

/**
 * Creates or retrieves a cached socket connection for a specific endpoint.
 *
 * @param  {string}                 endpoint  - The endpoint URL path to connect to.
 * @return {{clientSocket: object}}           - An object containing the socket client instance.
 */
export function useSocket (endpoint) {
  if (!initialized) {
    initialized = true
    config = useRuntimeConfig()
    serverHost = config.public.admin.socket.host
    socketTimeout = config.public.admin.socket.timeout
  }

  const endpointUrl = `${serverHost}${endpoint}`

  return {
    clientSocket: getClientSocket(endpoint, endpointUrl)
  }
}
// ---------------------------------------------------------------------------------------------------------------------
// SOCKET CONFIGURATION
// ---------------------------------------------------------------------------------------------------------------------

/**
 * Retrieves an existing socket connection from cache or establishes a new one.
 *
 * This function checks if a socket connection for a given endpoint already exists in the cache.
 * If so, it returns the cached connection. Otherwise, it creates a new socket connection,
 * stores it in the cache, and then returns the new connection.
 *
 * @param  {string} endpoint      - The endpoint URL path to connect to or check in the cache.
 * @param  {string} ENDPOINT_URL  - The full URL to connect to.
 * @return {object}               The socket client instance for the given endpoint.
 */
function getClientSocket (endpoint, ENDPOINT_URL) {
  if (connectionsCache[endpoint]) {
    console.log(`[SOCKET] Get socket ${ENDPOINT_URL} from cache...`)
    return connectionsCache[endpoint]
  }

  console.log(`[SOCKET] Configuring new socket for "${ENDPOINT_URL}"...`)
  const clientSocket = Client(ENDPOINT_URL)
  connectionsCache[endpoint] = clientSocket

  console.log(`[Bind]: Creating listeners for "${endpoint}"...`)
  clientSocket.on('connect', () => handleSocketConnection(clientSocket, endpoint))
  /**
   * Listener for 'bindUpdated' events emitted by the server. This function updates
   * the local bind cache with the latest data received from the server. It ensures
   * data consistency by updating only existing cache entries, and logs errors if
   * the update operation is unsuccessful or if the cache entry is missing.
   *
   * This approach consolidates event handling for 'bindUpdated' events into a single
   * listener, addressing potential memory leaks and improving scalability by preventing
   * the registration of multiple listeners for each bind operation. It contributes to
   * a more maintainable and efficient real-time data binding mechanism.
   *
   * @param {string} cacheKey  - The cache key associated with the bind operation, used
   *                           to identify the specific cache entry to update.
   * @param {object} response  - The response object from the server containing the update
   *                           data and success status. Expected to have 'success' and 'data'
   *                           properties, where 'success' is a boolean indicating the
   *                           success of the bind update operation, and 'data' contains
   *                           the updated value.
   */
  clientSocket.on('bindUpdated', (cacheKey, response) => {
    console.log(`[Bind] Updated "${cacheKey}":`, response)
    if (!response.success) {
      console.error(`[Bind] Bind Update "${cacheKey} failed! ${response.data}}`)
      // TODO: Avisar usuário (central de mensagem ou toast)
      return
    }
    if (bindCache[cacheKey] === undefined) {
      throw new Error(`Bind cache "${cacheKey}" does not exist`)
    }

    bindCache[cacheKey].value = response.data
    logCacheInfo()
  })

  /**
   * Emits a message and waits for a response. If the socket is not connected,
   * it waits for the connection to be established before emitting. It supports
   * await and implements a timeout for the response.
   *
   * @param  {...any}       args  - The arguments to emit, where the last argument is expected to be the callback function.
   * @return {Promise<any>}       A promise that resolves with the message from the socket.
   */
  clientSocket.pEmit = async (...args) => {
    console.log(`[SOCKET]: Emit ${args[0]}... Connected: ${clientSocket.connected}`)
    try {
      if (clientSocket.connected) {
        return await clientSocket.timeout(socketTimeout).emitWithAck(...args)
      } else {
        console.log('[SOCKET]: Waiting for connection...')
        return await new Promise((resolve, reject) => {
          clientSocket.once('connect', async () => {
            console.log('[SOCKET]: Connected!')
            try {
              resolve(await clientSocket.timeout(socketTimeout).emitWithAck(...args))
            } catch (e) {
              reject(e)
            }
          })
        })
      }
    } catch (e) {
      return {
        success: false,
        type: 'FRONTEND_ERROR',
        data: e.message
      }
    }
  }

  /**
   * Retrieves data for a given eventName and arguments from the server, caching the result.
   * If the data is already cached, it returns the cached data instead of making a new request.
   *
   * Note: This method should not be used for events that send data to the server, such as insert/update/delete operations.
   * due to the risk of updates and inserts might not be sent to the server
   *
   * Persistence requests may be cached and never sent to the server without warning (as it will return success as if
   * it had been sent), causing data inconsistency.
   *
   * @param  {string}       eventName  - The name of the event to request data for.
   * @param  {...any}       args       - Additional arguments to pass with the event.
   * @return {Promise<any>}            A promise that resolves with the server's response.
   */
  clientSocket.get = async (eventName, ...args) => {
    const cacheKey = createHash(eventName + JSON.stringify(args))

    if (!requestCache[cacheKey]) {
      console.log(`[SOCKET]: Request "${eventName}" key "${cacheKey}" not found in cache. Requesting...`)
      const response = await clientSocket.pEmit(eventName, ...args)

      if (!response.success) {
        console.log(`[Socket] Request "${eventName} failed, caching aborted!`)
        return response
      }

      requestCache[cacheKey] = {
        data: response
      }
    } else {
      console.log(`[SOCKET] Loading request "${eventName}" key "${cacheKey}" data from cache...`)
    }

    logCacheInfo()
    return requestCache[cacheKey].data
  }

  /**
   * Proactively caches the response for a given eventName and arguments by making a request to the server,
   * even if the data has not been requested yet. This is useful for pre-fetching data you anticipate needing soon.
   *
   * @param  {object}          [options]  - Optional configuration options for caching.
   * @param  {string}          eventName  - The name of the event to cache data for.
   * @param  {...any}          args       - Additional arguments to pass with the event.
   *
   * @return {Promise<object>}            A promise that resolves with an object containing cache details,
   *                                      including success status, cache size, and more.
   */
  clientSocket.cache = async (options = {}, eventName, ...args) => {
    const cacheKey = createHash(eventName + JSON.stringify(args))
    console.log(`[SOCKET]: Pre-caching "${eventName}" key "${cacheKey}" ...`)

    let response
    if (requestCache[cacheKey]) {
      response = requestCache[cacheKey].data
      console.log('[SOCKET]: Request is already in cache!')
    } else {
      response = await clientSocket.get(eventName, ...args)
    }

    const cacheSize = getSizeInBytes(requestCache)
    const cacheKeySize = getSizeInBytes(requestCache[cacheKey])

    return {
      success: response.success,
      cacheSize,
      cachePrettySize: prettyBytes(cacheSize),
      cacheKey,
      cacheKeySize,
      cacheKeyPrettySize: prettyBytes(cacheKeySize)
    }
  }

  /**
   * Registers a client-side binding to a specific server event and caches the response.
   * This method emits a 'bind' event to the server with the specified eventName and arguments.
   * It then listens for 'bindUpdated' events from the server to update the local cache with
   * the latest data. The bound data is made reactive and read-only to prevent client-side
   * modifications, ensuring the data consistency is maintained by the server updates.
   *
   * The bound data is accessible as a Vue ref, and updates will trigger reactivity in
   * components that use the data. This method is particularly useful for data that
   * needs to stay up to date with the server state without requiring manual refresh requests.
   *
   * @param  {any}    initialValue  - Initial value
   * @param  {string} eventName     - The name of the event to bind to.
   * @param  {...any} args          - Additional arguments to pass along with the event.
   *
   * @return {object}               - A Vue ref object containing the bound data, which is read-only.
   */
  clientSocket.bind = (initialValue, eventName, ...args) => {
    const cacheKey = createHash(eventName + JSON.stringify(args))

    // If the bind has already been done, it only returns reference
    if (bindCache[cacheKey] !== undefined) {
      logCacheInfo()
      return bindCache[cacheKey]
    }

    bindCache[cacheKey] = ref(initialValue)

    // Conecta no servidor
    console.log(`[SOCKET BIND] Emit: "${eventName}", "${cacheKey}"`, args)
    clientSocket.emit('bind', eventName, ...args)

    logCacheInfo()
    return bindCache[cacheKey]
  }

  /**
   * Waits for a specific event to be bound and resolves with the bound value.
   * If the first argument is an integer, it is used as the TTL (time to live) for the operation,
   * and the event name is then expected as the second argument, followed by any additional arguments.
   * If the first argument is a string, a default TTL of 30000 milliseconds is used,
   * with the first argument as the event name and any subsequent arguments passed through.
   *
   * @param  {number|string} firstArg  - The TTL (time to live) in milliseconds if an integer,
   *                                   or the event name if a string.
   * @param  {...any}        args      - The event name (if firstArg is TTL) followed by arguments for the event.
   * @return {Promise<any>}            A promise that resolves with the event bind value or
   *                                   rejects in case of timeout or errors.
   */
  clientSocket.bindWait = (firstArg, ...args) => {
    let ttl, eventName

    if (typeof firstArg === 'number') {
      ttl = firstArg
      eventName = args.shift() // Removes and returns the first element as eventName
    } else if (typeof firstArg === 'string') {
      ttl = 30000 // Default TTL
      eventName = firstArg
    } else {
      throw new Error('Invalid first argument type for bindWait. Must be a number (TTL) or string (eventName).')
    }

    return new Promise((resolve, reject) => {
      console.log(`[SOCKET BIND] WaitBind: "${eventName}"...`)
      const cacheKey = createHash(eventName + JSON.stringify(args))
      const bindValue = clientSocket.bind(notLoaded, eventName, ...args)

      if (bindValue.value !== notLoaded) {
        console.log(`[SOCKET BIND] WaitBind: "${eventName}" already lodaded!`)
        resolve(bindValue)
        return
      }

      // eslint-disable-next-line prefer-const
      let stopWatching

      const timeoutHandler = setTimeout(() => {
        reject(new Error(`Timeout waiting for bind "${eventName}"`))
        stopWatching()
      }, ttl)

      stopWatching = watch(bindValue, newValue => {
        if (newValue !== notLoaded) {
          console.log(`[SOCKET BIND] WaitBind: "${eventName}" loaded!`)
          clearTimeout(timeoutHandler)
          resolve(bindCache[cacheKey])
          logCacheInfo()
        }
      })
    })
  }

  return clientSocket
}

// ---------------------------------------------------------------------------------------------------------------------
// PRIVATE
// ---------------------------------------------------------------------------------------------------------------------

/**
 * Generates a SHA-1 hash of an input string.
 *
 * This function creates a jsSHA object, sets it up to use the SHA-1 algorithm
 * with text inputs, then generates the hash of the provided input string.
 * The result is returned as a hexadecimal string.
 *
 * @param  {string} input  - The input string for which the SHA-1 hash will be generated.
 * @return {string}        The SHA-1 hash of the input, represented as a hexadecimal string.
 */
function createHash (input) {
  // eslint-disable-next-line new-cap
  const shaObj = new jsSHA('SHA-1', 'TEXT')
  shaObj.update(input)
  return shaObj.getHash('HEX')
}

/**
 * Handles socket connection events and packet logging.
 *
 * This function is intended to be private and used within the useSocket module to
 * set up logging for socket connection events and packets.
 *
 * @param {object} clientSocket  - The client socket instance.
 * @param {string} endpoint      - The endpoint URL path connected to.
 */
function handleSocketConnection (clientSocket, endpoint) {
  const engine = clientSocket.io.engine
  console.log(`[SOCKET] Successfully connected to Socket.io server. SocketID: "${clientSocket.id}". EndPoint: "${endpoint}"`)

  // Logs received messages
  engine.on('packet', ({ type, data }) => {
    if (type === 'message') {
      console.log(`[SOCKET] Received ${type}:`, { data })
    }
  })

  // Logs sent messages
  engine.on('packetCreate', ({ type, data }) => {
    if (type === 'message') {
      console.log(`[SOCKET] Sent ${type}:`, { data })
    }
  })
}

/**
 * Calculates the approximate size of a JavaScript object in bytes.
 * This function converts the object into a JSON string and then uses the TextEncoder
 * to measure the length of the resulting string in UTF-8 bytes. It provides an estimate
 * of the memory usage of the object, although the exact byte size in memory may vary.
 *
 * @param  {any}    obj  - The object for which the size in bytes is to be calculated.
 * @return {number}      - The approximate size of the object in bytes.
 */
function getSizeInBytes (obj) {
  let str = null
  if (typeof obj === 'string') {
    // If obj is a string, then use it
    str = obj
  } else {
    // Else, make obj into a string
    str = JSON.stringify(obj)
  }
  // Get the length of the Uint8Array
  return new TextEncoder().encode(str).length
}

function logCacheInfo () {
  if (import.meta.dev) {
    const requestCacheSize = prettyBytes(getSizeInBytes(requestCache))
    const bindCacheSize = prettyBytes(getSizeInBytes(bindCache))
    const totalCacheSize = prettyBytes(getSizeInBytes([requestCache, bindCache]))
    console.log(`[SOCKET] Cache size: RequestCache ${requestCacheSize}. BindCache: ${bindCacheSize}. Total: ${totalCacheSize}`)
  }
}
