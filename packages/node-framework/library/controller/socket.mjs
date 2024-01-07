/**
 * Created on 28/07/23
 *
 * @file library/controller/socket-mixin.mjs
 * Socket,io Controller
 *
 * @module socket-mixin
 * @author André Timermann <andre@timermann.com.br>
 */
import BaseController from './base-controller.mjs'

/**
 *
 */
export default class SocketController extends BaseController {
  /**
   * Holds the instance of the Socket.io server.
   *
   * @type {import("socket.io").Server}
   */
  io = undefined

  /**
   * Returns a namespace instance from the Socket.io server.
   *
   * @param  {string}                        path  Path of the namespace
   * @return {import("socket.io").Namespace}       The namespace instance
   */
  namespace (path) {
    return this.io.of(path)
  }

  /**
   * Method that should be overridden by the user, implementing the application's logic.
   *
   * @async
   */
  async setup () {
    throw new Error(`Mandatory to define setup method in ${this.completeIndentification}.`)
  }
}
