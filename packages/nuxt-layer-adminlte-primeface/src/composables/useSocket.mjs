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
import { useRuntimeConfig } from '#imports'

/**
 * Cache for storing active socket connections
 *
 * @type {{}}
 */
const connectionsCache = {}

/**
 * Creates or retrieves a cached socket connection for a specific endpoint.
 *
 * @param  {string}                 endpoint  - The endpoint URL path to connect to.
 * @return {{clientSocket: object}}           - An object containing the socket client instance.
 */
export function useSocket (endpoint) {
  const config = useRuntimeConfig()
  const serverHost = config.public.admin.socket.host
  const socketTimeout = config.public.admin.socket.timeout

  const endpointUrl = `${serverHost}${endpoint}`

  const clientSocket = getCachedOrNewConnection(endpoint, endpointUrl)

  clientSocket.on('connect', () => handleSocketConnection(clientSocket, endpoint))

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

  return {
    clientSocket
  }
}

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
function getCachedOrNewConnection (endpoint, ENDPOINT_URL) {
  if (connectionsCache[endpoint]) {
    console.log(`[SOCKET] Get socket ${ENDPOINT_URL} from cache...`)
    return connectionsCache[endpoint]
  }

  console.log(`[SOCKET] Connecting to server ${ENDPOINT_URL}...`)
  const clientSocket = Client(ENDPOINT_URL)
  connectionsCache[endpoint] = clientSocket

  return clientSocket
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

// function decomposeSocketIOString (str) {
//   // Procura por ',' que separa a parte do namespace/evento do payload JSON
//   const separatorIndex = str.indexOf(',')
//
//   // Extrai a parte do namespace/evento e o payload JSON
//   const eventPart = str.substring(0, separatorIndex)
//   const jsonPayload = str.substring(separatorIndex + 1)
//
//   // Separa o tipo de mensagem (se houver) e o namespace
//   const [messageType, namespace] = eventPart.split('/', 2)
//
//   // Tenta analisar o payload JSON
//   try {
//     const data = JSON.parse(jsonPayload.substring(1, jsonPayload.length - 1)) // Remove os colchetes iniciais e finais
//
//     return { messageType, namespace, data }
//   } catch (error) {
//     return { messageType, namespace, data: jsonPayload }
//   }
// }
