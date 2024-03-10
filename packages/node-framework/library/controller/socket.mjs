/**
 * Created on 28/07/23
 *
 * @file library/controller/socket-mixin.mjs
 * Socket,io Controller
 *
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
 * The type of the socket event.
 *
 * `MUTATE`: Used for events that result in modifications to the data state.
 * These events can include creating, updating, or deleting data.
 * Events of this type typically trigger updates to all clients listening
 * to the affected data to ensure all users have the most current information.
 *
 * `QUERY`: Designed for events that fetch data without modifying the data state.
 * These events are used to request and retrieve data from the server.
 * Query events can be cached and may be used in conjunction with BIND events
 * to keep the frontend updated with the latest data without causing unnecessary data mutations.
 *
 * `NOACTION`: Indicates events that neither modify the data state nor fetch data.
 * These events are purely informative and might be used for logging,
 * debugging, or signaling specific states or actions within the application.
 * No action is taken in terms of data manipulation or updates, and binding
 * or triggering updates for these events is not permitted.
 *
 * @typedef {'MUTATE'|'QUERY'|'NOACTION'} SocketEventType
 */
/**
 * Represents a single event to be registered on a socket connection.
 *
 * @typedef {object} SocketEvent
 * @property {string}          path  - The event name to listen for.
 * @property {EventCallback}   fn    - The async callback function to handle the event.
 * @property {SocketEventType} type  - The event type, can be either 'MUTATE', 'QUERY' or 'NOACTION'.
 */

/**
 * Represents the structure of an error payload returned by event handlers.
 *
 * @typedef {object} PayloadError
 * @property {boolean}       success  - Indicates if the operation was successful. Always false for errors.
 * @property {any}           data     - Additional data about the error. Could be an error message, details, or any other relevant information.
 * @property {string}        type     - The type of the error, such as 'API_ERROR' or 'GENERIC_ERROR'.
 * @property {any}           meta     - Optional metadata associated with the error. Can be used to provide additional context or details.
 * @property {string}        message  - A human-readable message describing the error.
 * @property {string|number} code     - An optional error code that can be used to categorize or identify the error.
 */

import BaseController from './base-controller.mjs'
import createLogger from '../logger.mjs'
import ApiError from '../api/api-error.mjs'
import Rooms from '../socket/rooms.mjs'
const logger = createLogger('SocketController')

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
   *
   * @type {{[eventName: string]: SocketEvent}}
   */
  indexedEvents = {}

  /**
   * Registers an event listener with a callback function for the specified event.
   * This event type is designated as 'NOACTION', indicating that no action is taken
   * upon its invocation. It is not permitted to bind this event type, nor will it trigger
   * an update event. This is suitable for events that are purely informative and do not
   * require interaction with the data state or notification mechanisms.
   *
   * @param {string}        path  The event name to listen for.
   * @param {EventCallback} fn    The callback function to handle the event. The function can process the event but should not expect to alter data state or trigger updates.
   *
   *                              Note: Since this event type does not influence data state or client updates, it should be used for scenarios where event handling is self-contained and does not interact with broader application state or behaviors.
   */
  on (path, fn) {
    this.#on(path, fn, 'NOACTION')
  }

  /**
   * Registers a query event listener and a callback function for fetching data.
   * This type of event can be cached and can be called in a BIND event type,
   * which is a special event that keeps the frontend always up to date by sending
   * a bindUpdated event whenever a new data update occurs.
   *
   * @param {string}        path  The event name to listen for fetching data.
   * @param {EventCallback} fn    The async callback function to handle the event. It should return the data to be sent back to the client.
   *                              On success, the callback response includes { success: true, data }.
   *                              On failure, it includes { success: false, data: error.message }.
   */
  onQuery (path, fn) {
    this.#on(path, fn, 'QUERY')
  }

  /**
   * Registers a mutate event listener and a callback function for operations that modify data.
   * This type of event cannot be cached and will generate an error if an attempt is made to bind it.
   * Whenever it is executed, it triggers an update event on the bind to update all connected client sockets.
   *
   * @param {string}        path  The event name to listen for operations that modify data.
   * @param {EventCallback} fn    The async callback function to handle the event. It should perform the data modification operation and return the result to be sent back to the client.
   *                              On success, the callback response includes { success: true, data }.
   *                              On failure, it includes { success: false, data: error.message }.
   * @throws {Error} If an attempt is made to bind this event type.
   */
  onMutate (path, fn) {
    this.#on(path, fn, 'MUTATE')
  }

  /**
   * Registers an event listener and a callback function for the specified event.
   * If an event with the same name already exists, an error is thrown.
   *
   * @param {string}          path  The event name to listen for.
   * @param {EventCallback}   fn    The async callback function to handle the event. It should return the data to be sent back to the client.
                                    On success, the callback response includes { success: true, data }.
                                    On failure, it includes { success: false, data: error.message }.
   * @param {SocketEventType} type  Type of listener:
   * @throws {Error} If an event with the same name already exists.
   */
  #on (path, fn, type) {
    if (path === 'bind') {
      throw new Error(`An event with the name "${path}" is reserved.`)
    }

    if (this.events.some(event => event.path === path)) {
      throw new Error(`An event with the name "${path}" in "${this.completeIndentification}" already exists.`)
    }

    const newEvent = {
      path,
      fn,
      type
    }

    this.events.push(newEvent)
    this.indexedEvents[path] = newEvent
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
      socket.on(event.path, async (...args) => {
        await this.#callEvent(event, args)
      })
    }
  }

  /**
   * Checks if an event with the specified name exists in the controller.
   *
   * @param  {string}  eventName  - The name of the event to check for existence.
   * @return {boolean}            - True if the event exists, false otherwise.
   */
  hasEvent (eventName) {
    return !!this.indexedEvents[eventName]
  }

  /**
   * Triggers a query event by its name with the provided arguments. Only query operations are allowed when using the bind feature.
   * If the event does not exist or is not a QUERY type, it throws an error. Otherwise, it resolves with the response from the event's callback function.
   *
   * @param  {string}       eventName  - The name of the query event to trigger.
   * @param  {...any}       args       - The arguments to pass to the event's callback function.
   * @return {Promise<any>}            - A promise that resolves with the callback response of the triggered event.
   * @throws {Error} If the event does not exist or is not a QUERY type.
   */
  async triggerQueryEvent (eventName, ...args) {
    if (this.indexedEvents[eventName]) {
      const socketEvent = this.indexedEvents[eventName]

      if (socketEvent.type !== 'QUERY') {
        throw new Error(`Only query operations are allowed when using the bind feature. "${eventName}" is marked as ${socketEvent.type}. Define the endpoint ${eventName} with onQuery in the socket controller.`)
      }
    } else {
      throw new Error(`Event "${eventName}" does not exist.`)
    }

    return this.triggerEvent(eventName, ...args)
  }

  /**
   * Triggers an event by its name with the provided arguments. If the event does not exist,
   * it rejects the promise with an error. Otherwise, it resolves with the response from the event's callback function.
   *
   * @param  {string}       eventName  - The name of the event to trigger.
   * @param  {...any}       args       - The arguments to pass to the event's callback function.
   * @return {Promise<any>}            - A promise that resolves with the callback response of the triggered event.
   * @throws {Error} - If the event does not exist.
   */
  async triggerEvent (eventName, ...args) {
    return new Promise((resolve, reject) => {
      if (!this.indexedEvents[eventName]) {
        reject(new Error(`Event "${eventName}" does not exist in this controller. Available events: ${Object.keys(this.indexedEvents).join(', ')}`))
      }

      /**
       * The callback function that is invoked with the response of the event's handler.
       * This callback is responsible for resolving the promise with the response received
       * from the event's handler function. It enables the asynchronous processing of events
       * and handling of their responses in a Promise-based manner.
       *
       * @param {any} response  - The response from the event's handler function.
       */
      const callback = response => {
        resolve(response)
      }

      try {
        const socketEvent = this.indexedEvents[eventName]

        this.#callEvent(socketEvent, [...args, callback])
      } catch (e) {
        reject(e)
      }
    })
  }

  /**
   * Internally called to handle an event invocation. Executes the event's callback function with provided arguments.
   * If the callback is not a function, or no response is expected (and received), it logs an error.
   * In case of exceptions, logs or returns an error response depending on the presence of a callback.
   *
   * @param {SocketEvent} event  - The event object containing the path and callback function.
   * @param {Array<any>}  args   - The arguments to pass to the event's callback function, including the callback function itself as the last argument.
   */
  async #callEvent (event, args) {
    let callback = args[args.length - 1]
    if (typeof callback !== 'function') callback = undefined
    const dataArgs = callback ? args.slice(0, -1) : args

    try {
      logger.debug('New event.')
      const response = await event.fn(...dataArgs)

      if (callback === undefined && response !== undefined) {
        logger.error('Client did not specify a callaback, response lost.')
      }

      if (callback !== undefined) {
        callback({ success: true, data: response })

        if (event.type === 'MUTATE') {
          Rooms.updateByController(this)
        }
      }
    } catch (error) {
      /**
       * @type {PayloadError}
       */
      const payloadError = { success: false, data: null, type: '', meta: undefined, message: '', code: undefined }

      if (error instanceof ApiError) {
        // ------------------------------------------
        // API_ERROR
        // ------------------------------------------
        payloadError.type = 'API_ERROR'
        payloadError.data = error.inner
        payloadError.type = error.type
        payloadError.meta = error.meta
        payloadError.message = error.message
        payloadError.code = error.code
      } else {
        // ------------------------------------------
        // GENERIC
        // ------------------------------------------
        payloadError.type = 'GENERIC_ERROR'
        payloadError.data = error.message
      }

      callback
        ? callback(payloadError)
        : logger.error(JSON.stringify(payloadError))
    }
  }
}
