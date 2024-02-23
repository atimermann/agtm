/**
 * @file Helloworld Demo
 */
import { Config, createLogger, SocketController } from '@agtm/node-framework'
const logger = createLogger('HelloWorld')

/**
 *
 */
export default class HelloWorldController extends SocketController {
  namespace = '/hello-world'

  /**
   * Sockets.
   */
  async setup () {
    // Get Prisma DSN
    logger.debug(Config.get('myconfig'))

    //  Events
    this.on('product:create', async (data) => {
      return true
    })

    this.on('product:get', async (data) => {
      return { name: 'New Product' }
    })

    // Direct access

    // Socket.IO instance Object
    this.io.on('connection', socket => {
      socket.emit('hello', 1, '2', { 3: '4', 5: Buffer.from([6]) })
    })

    // Socket.io server namespaced
    this.nsp.on('connection', async socket => {
      socket.emit('hello', 1, '2', { 3: '4', 5: Buffer.from([6]) })
      logger.debug(`Clientes connected: ${this.nsp.sockets.size}`)
    })
  }
}
