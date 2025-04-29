/**
 * Created on 09/03/24
 *
 * @file
 * This module provides a management system for rooms within a Socket.io application.
 * It supports creating unique rooms based on event names and arguments, caching room data,
 * and efficiently handling socket connections and data synchronization across clients.
 * Designed to work with Socket.io, it extends functionality for dynamic data binding,
 * caching responses, and handling real-time updates.
 *
 * @author André Timermann <andre@timermann.com.br>
 *
 * @typedef {import('../controller/socket.mjs').default} SocketController
 * @typedef {import("socket.io").Namespace} Namespace
 * @typedef {import("socket.io").Socket} Socket
 */

import jsSHA from 'jssha'
import createLogger from '../logger.mjs'
import prettyBytes from 'pretty-bytes'

const logger = createLogger('SocketRoom')

/**
 * The Room class manages rooms within a Socket.io application, handling creation, data caching,
 * and synchronization of room states across connected clients.
 */
export default class Room {
  /**
   * A static map holding all active room instances, keyed by a unique identifier based on the event name and arguments.
   *
   * @type {Map<string, Room>}
   */
  static rooms = new Map()

  /**
   * The name of the room, typically derived from a combination of the event name and arguments for uniqueness.
   *
   * @type {string}
   */
  name

  /**
   * The name of the event that this room is linked to, used for emitting and listening for updates.
   *
   * @type {string}
   */
  eventName

  /**
   * The list of arguments associated with the emit event. Used for constructing the unique room name and handling event emissions.
   *
   * @type {Array<any>}
   */
  emitArgs

  /**
   * Cached data from requests associated with this room. This cache is used to avoid unnecessary data fetches and to synchronize client states.
   *
   * @type {any}
   */
  cacheData

  /**
   * Instances of SocketController associated with this room, all operating under the same namespace. These controllers manage the logic for handling socket events specific to the room.
   *
   * @type {SocketController[]}
   */
  socketControllers

  /**
   * The namespace instance from the Socket.io server that this room is associated with. This is used for emitting events and managing sockets within the namespace.
   *
   * @type {Namespace}
   */
  nsp

  /**
   * Creates or retrieves a room if it does not already exist, based on the combination of eventName and emitArgs.
   * Initializes a new room with the provided parameters if the specified room does not exist in the cache.
   *
   * @param  {string}             eventName          - The name of the event associated with the room.
   * @param  {any[]}              emitArgs           - Arguments that will be used when emitting events for this room.
   * @param  {SocketController[]} socketControllers  - A list of socket controllers associated with this room.
   * @param  {Namespace}          nsp                - The Socket.io Namespace associated with this room.
   *
   * @return {Room}                                  The newly created or existing room.
   *
   * @static
   */
  static createIfNotExist (eventName, emitArgs, socketControllers, nsp) {
    const roomName = this.createHash(eventName + JSON.stringify(emitArgs))

    if (!Array.isArray(socketControllers)) throw new TypeError('socketController must be array')
    if (socketControllers.length === 0) throw new TypeError('It is mandatory to define at least one socketController')

    if (this.rooms.has(roomName)) return this.rooms.get(roomName)

    logger.debug(`Creating new room: "${roomName}"`)

    const newRoom = new Room()
    newRoom.eventName = eventName
    newRoom.emitArgs = emitArgs
    newRoom.name = roomName
    newRoom.socketControllers = socketControllers
    newRoom.nsp = nsp

    this.rooms.set(roomName, newRoom)
    return newRoom
  }

  /**
   * Updates the data of all rooms associated with the given socket controller.
   * Iterates over all rooms in the cache, checking for rooms that include the specified
   * socket controller and triggering an update for those rooms.
   *
   * @param {SocketController} socketController  - The socket controller to use as a filter for updating rooms.
   * @param {Socket|null}      socket            - If null, send event through this socket (The broadcast
   *                                             method ensures that the message will be sent to all connected clients
   *                                             except the socket that initiated the sending).
   */
  static updateByController (socketController, socket = null) {
    for (const room of this.rooms.values()) {
      if (room.socketControllers.includes(socketController)) {
        // Update Room
        room.update(socket).catch(error => console.error(`Error updating room: ${error}`))
      }
    }
  }

  /**
   * Shows information about the current room, including the number of connected sockets,
   * room size in bytes, total number of rooms, and total size of all rooms.
   * Logs this information for debugging purposes.
   */
  async showRoomsInfo () {
    const socketCount = (await this.nsp.in(this.name).fetchSockets()).length
    logger.debug(`User in this room: ${socketCount}`)
    logger.debug(`Room size: ${prettyBytes(this.getSizeInBytes(this.cacheData))}`)
    logger.debug(`Total rooms: ${Room.rooms.size}`)
    logger.debug(`Total size: ${prettyBytes(this.getSizeInBytes(Room.rooms))}`)
  }

  /**
   * Triggers a query event to fetch data from associated socket controllers based on this room's event name.
   * Iterates over the socket controllers associated with this room and triggers the query event if the controller
   * has an event handler for the specified event name. Throws an error if no matching event handler is found.
   *
   * @return {Promise<any>} The data fetched from the socket controller.
   */
  async triggerQueryEvent () {
    logger.debug(`Fetch data from "${this.eventName}..."`)

    for (const socketController of this.socketControllers) {
      if (socketController.hasEvent(this.eventName)) {
        return await socketController.triggerQueryEvent(this.eventName, ...this.emitArgs)
      }
    }

    throw new Error(`Event ${this.eventName} not found.`)
  }

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
  static createHash (input) {
     
    const shaObj = new jsSHA('SHA-1', 'TEXT')
    shaObj.update(input)
    return shaObj.getHash('HEX')
  }

  /**
   * Adds a socket to this room, joining the socket to the Socket.io room.
   * Logs the event of a socket joining the room and displays room information.
   * If cached data exists for this room, it sends the cached data to the newly joined socket;
   * otherwise, it triggers an update to fetch and cache the latest data.
   *
   * @param {Socket} socket  - The socket instance to join to the room.
   */
  join (socket) {
    socket.join(this.name)

    logger.debug(`Socket: "${socket.id}" join into the room "${this.name}"`)
    this.showRoomsInfo().catch(e => logger.error(e))

    // Sends cached data to the client on the first connection
    this.cacheData === undefined
      ? this.update().catch(e => logger.error(e))
      : socket.emit('bindUpdated', this.name, this.cacheData)
  }

  /**
   * Updates the data for this room, caching the result, and emitting an update event to all sockets in the room.
   * If the room has no connected sockets, it clears the cached data and aborts the update.
   *
   * @param {Socket|null} socket  - If null, send event through this socket (The broadcast
   *                              method ensures that the message will be sent to all connected clients
   *                              except the socket that initiated the sending).
   */
  async update (socket = null) {
    const socketRoom = socket
      ? socket.to(this.name)
      : this.nsp.to(this.name)

    if (socket) logger.debug(`Update room by "${socket.id}"`)

    try {
      const socketCount = (await this.nsp.in(this.name).fetchSockets()).length
      if (socketCount > 0) {
        const response = await this.triggerQueryEvent()
        logger.debug(`Update room "${this.name}"`)

        this.cacheData = response
        socketRoom.emit('bindUpdated', this.name, response)
      } else {
        this.cacheData = undefined
        logger.info(`Room ${socketCount} is empty. Update aborted and clean cache! `)
      }

      this.showRoomsInfo().catch(e => logger.error(e))
    } catch (e) {
      socketRoom.emit('bindUpdated', this.name, { success: false, data: e.message })
    }
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
  getSizeInBytes (obj) {
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
}
