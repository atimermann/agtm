/**
 * **Created on 07/01/2024**
 *
 * @file library/controller/core.mjs
 *
 * @author André Timermann <andre@timermann.com.br>
 */

import createLogger from '../../library/logger.mjs'
import BaseController from './base-controller.mjs'
const logger = createLogger('Controller')

/**
 *
 * Represents a base controller class in the MVC architecture. It's an abstract class and should not be instantiated directly.
 */
export default class CoreController extends BaseController {
  /**
   * Abstract setup method, used for initial execution. Should be implemented by subclasses.
   */
  async setup () {
    logger.debug(`Setup not implemented in ${this.completeIndentification}.`)
  }
}
