/**
 * **Created on 07/06/2023**
 *
 * @author André Timermann <andre@timermann.com.br>
 *
 * @file
 * Class responsible for managing the execution of jobs in a separate process. It orchestrates
 * the job lifecycle, including setup, execution, and teardown.
 *
 * @typedef {import('./job.mjs').default} Job
 * @typedef {import('../application.mjs').default} Application
 */

import { logger } from '../../index.mjs'
import JobManager from './job-manager.mjs'

/**
 * Class responsible for managing the execution of jobs in a separate process. It orchestrates
 * the job lifecycle, including setup, execution, and teardown.
 */
export default class WorkerRunner {
  /**
   * Job running
   *
   * @type {Job}
   * @static
   */
  static job = undefined

  /**
   * Pid of parent process
   *
   * @type {*}
   */
  static parentPid = undefined

  /**
   * This method is execution of a worker in a separate process.
   * It loads all jobs and executes the specific job that matches the command-line arguments.
   *
   * @param  {Application}   application  - The application context.
   *
   * @throws Will throw an error if the specific job could not be found.
   *
   * @return {Promise<void>}
   *
   * @static
   */
  static async run (application) {
    this.parentPid = process.ppid

    const [, , , applicationName, appName, controllerName, jobName] = process.argv

    await JobManager.load(application)

    this.job = JobManager.getJob(
      applicationName,
      appName,
      controllerName,
      jobName
    )

    this.#createProcessListeners(this.job)

    for (const setupFunction of this.job.setupFunctions) {
      logger.info(`Running job setup from "${this.job.name}" `)
      try {
        await setupFunction()
      } catch (e) {
        logger.error(e)
        process.exit(3)
      }
    }

    logger.info(`Running job "${this.job.name}" `)
    try {
      await this.job.jobFunction()
    } catch (e) {
      logger.error(e)
      await this.exitProcess(4)
    }

    for (const teardownFunction of this.job.teardownFunctions) {
      logger.info(`Running job teaddown from  "${this.job.name}" `)
      try {
        await teardownFunction()
      } catch (e) {
        logger.error(e)
        process.exit(5)
      }
    }

    logger.info(`Process closed! PID: ${process.pid}`)
    process.exit(0)
  }

  /**
   * End process by executing tearDown functions.
   *
   * @param {number} exitCode  Exit code
   */
  static async exitProcess (exitCode = 0) {
    await this.#exitProcess(this.job, exitCode)
  }

  /**
   * Sets up a listener for the SIGINT event, which is triggered when the user presses Ctrl+C.
   * The application then calls the 'jobTeardown' method of the controller and finally terminates itself.
   * SIGKILL and SIGTERM should be handled by the application.
   *
   * @param  {Job}  job  - The Job in execution
   *
   * @return {void}
   *
   * @static
   */
  static #createProcessListeners (job) {
    process.once('SIGINT', async () => {
      await this.#exitProcess(job)
    })

    // Close if disconnected from parent
    process.on('disconnect', async () => {
      logger.error('Parent disconnected. Closing...')
      await this.#exitProcess(job)
    })

    // check if parent is active
    setInterval(async () => {
      try {
        logger.debug('Check parent...')
        // Transmit a neutral signal (0) to verify if the parent responds
        process.kill(this.parentPid, 0)
      } catch (err) {
        logger.error('Parent disconnected. Closing...')
        await this.#exitProcess(this.job)
      }
    }, 10000) // Check every second
  }

  /**
   * Terminates the job execution process.
   * This method executes the teardown functions of the job and then exits the process with a specified exit code.
   *
   * @param  {Job}           job         - The job currently in execution.
   * @param  {number}        [exitCode]  - The exit code used to terminate the process. Defaults to 0.
   * @return {Promise<void>}
   */
  static async #exitProcess (job, exitCode = 0) {
    try {
      for (const teardownFunction of job.teardownFunctions) {
        logger.info(`Running job teardown on ERROR from  "${this.job.name}" `)
        await teardownFunction()
      }
    } catch (error) {
      console.error(error)
    } finally {
      logger.info(`Process closed! PID: ${process.pid}`)
      process.exit(exitCode)
    }
  }
}
