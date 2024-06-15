/**
 * **Created on 05/01/2024**
 *
 * apps/main/controllers/helloWorld.mjs
 *
 * @author André Timermann <andre@timermann.com.br>
 *
 * @file Helloworld Demo
 */
import { JobsController, createLogger } from '@agtm/node-framework'
const logger = createLogger('HelloWorld')

/**
 *
 */
export default class HelloWorldJobs extends JobsController {
  /**
   * Initialization.
   *
   */
  async setup () {
    logger.info('Configuring your project...')

    this.createJob('Scheduled Job', '*/10 * * * * *', async () => {
      logger.info('Sleep 2min...')
    })

    this.createJob('One-Time Job', 'now', async () => {
      logger.info('Execute one time')
      this.exit(1)
    })

    this.createJob('Continuous Job', null, async () => {
      logger.info('Starting Worker...')
    })

    this.createWorkers('Worker', 'Continuous Job', {
      concurrency: 3
    })

    this.createJob('My Job', null, async () => {
      logger.info('My Job OK')
    })
  }
}
