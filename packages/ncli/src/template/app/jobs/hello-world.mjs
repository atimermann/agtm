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

    this.createJob('JOB SCHEDULE', '*/10 * * * * *', async () => {
      logger.info('Sleep 2min...')
    })

    this.createJob('JOB NOW', 'now', async () => {
      logger.info('Execute one time')
    })

    this.createJob('JOB CONTINUOS', null, async () => {
      logger.info('Starting Worker...')
    })

    this.createWorkers('WORKER', 'JOB CONTINUOS', {
      concurrency: 3
    })
  }
}
