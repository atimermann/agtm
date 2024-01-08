/**
 * **Created on 05/01/2024**
 *
 * apps/main/controllers/helloWorld.mjs
 *
 * @author André Timermann <andre@timermann.com.br>
 *
 * @file Helloworld Demo
 */
import { SocketController, createLogger, Config } from '@agtm/node-framework'

const logger = createLogger('HelloWorld')

/**
 *
 */
export default class HelloWorldController extends SocketController {


  /**
   * Sockets.
   */
  setup () {
    this.namespace('/my-namespace').on('connection', socket => {
      socket.emit('newData', { nane: 'João' })
    })

    this.namespace('/admin', socket => {
      socket.on('delete user', () => {
        // ...
      })
    })
  }

}
