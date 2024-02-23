/**
 * Created on 28/07/23
 *
 * @file library/controller/socket-mixin.mjs
 * Socket,io Controller
 *
 * @module socket-mixin
 * @author André Timermann <andre@timermann.com.br>
 *
 * @typedef {object} CallbackResponse
 * @property {boolean}                   success  Indicates if the operation was successful.
 * @property {any}                       data     The data to be sent back to the client. On success, it's the result data; on failure, it's the error message.
 *
 *
 * @typedef {Function} EventCallback
 * A callback function to handle socket events.
 * @param    {any}                       data     The data received from the client.
 * @return   {Promise<CallbackResponse>}          A promise that resolves to a CallbackResponse object.
 */

/**
 * Represents a single event to be registered on a socket connection.
 *
 * @typedef {object} SocketEvent
 * @property {string}        path  - The event name to listen for.
 * @property {EventCallback} fn    - The async callback function to handle the event.
 */

import BaseController from './base-controller.mjs'
import createLogger from '../logger.mjs'
const logger = createLogger('BaseController')

/**
 *
 */
export default class SocketController extends BaseController {
  /**
   * Namespace associated with this controller.
   *
   * @type {string}
   */
  namespace = '/'

  /**
   * Holds the instance of the Socket.io server.
   *
   * @type {import("socket.io").Server}
   */
  io = undefined

  /**
   * Holds the instance of the Socket.io server namespaced.
   *
   * @type {import("socket.io").Namespace}
   */
  nsp

  /**
   * A list of events to be registered on new connections.
   *
   * @type {SocketEvent[]}
   */
  events = []

  /**
   * Registers an event listener and a callback function for the specified event.
   * If an event with the same name already exists, an error is thrown.
   *
   * @param {string}        path  The event name to listen for.
   * @param {EventCallback} fn    The async callback function to handle the event. It should return the data to be sent back to the client.
   *                              On success, the callback response includes { success: true, data }.
   *                              On failure, it includes { success: false, data: error.message }.
   * @throws {Error} If an event with the same name already exists.
   */
  on (path, fn) {
    if (this.events.some(event => event.path === path)) {
      throw new Error(`An event with the name "${path}" in "${this.completeIndentification}" already exists.`)
    }

    this.events.push({ path, fn })
  }

  /**
   * Method that should be overridden by the user, implementing the application's logic.
   *
   * @async
   */
  async setup () {
    throw new Error(`Mandatory to define setup method in ${this.completeIndentification}.`)
  }

  /**
   * Handles new client connections by registering predefined events.
   *
   * @param {import("socket.io").Socket} socket  - The socket instance for the connection.
   */
  async newConnection (socket) {
    logger.debug(`New client connected: ${socket.id}. Clientes connected: ${this.nsp.sockets.size}`)

    // For each new connection, it records events defined in setup
    for (const event of this.events) {
      logger.debug(`Registering event "${event.path}" for socket "${socket.id}"`)
      this.#registerEventForSocket(socket, event)
    }
  }

  /**
   * Registers an event for a specific socket.
   *
   * @param {import("socket.io").Socket} socket  - The socket instance.
   * @param {SocketEvent}                event   - The event object containing the path and callback function.
   */
  #registerEventForSocket (socket, event) {
    socket.on(event.path, async (data, callback) => {
      try {
        logger.debug(`New event. Socket: ${socket.id} `)
        const result = await event.fn(data)
        callback({ success: true, data: result })
      } catch (err) {
        callback({ success: false, data: err.message })
        logger.error(JSON.stringify({ message: err.message, stack: err.stack }))
      }
    })
  }
}
