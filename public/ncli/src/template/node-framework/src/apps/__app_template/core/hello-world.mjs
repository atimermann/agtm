/**
 * **Created on 05/01/2024**
 *
 * apps/main/controllers/helloWorld.mjs
 *
 * @author André Timermann <andre@timermann.com.br>
 *
 * @file Helloworld Demo
 */
import { CoreController, createLogger, Config } from '@agtm/node-framework'

const logger = createLogger('HelloWorld')

/**
 *
 */
export default class HelloWorldController extends CoreController {
  /**
   * Initialization.
   *
   */
  async setup () {
    logger.info('Configuring your project...')
    logger.info(`Timezone: ${Config.get('httpServer.timezone')}`)
  }
}
