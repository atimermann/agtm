/**
 * **Created on 07/06/2023**
 *
 * library/jobs/job.mjs
 *
 * @author André Timermann <andre@timermann.com.br>
 *
 * @typedef {import('./worker.mjs').default} Worker
 */

import createLogger from '../logger.mjs'
import { EventEmitter } from 'node:events'
import crypto from 'node:crypto'

const logger = createLogger('WorkerManager')

/**
 * Represents a Job object in the system. This object holds the necessary details
 * to manage and execute specific tasks or processes within the application.
 *
 * @augments EventEmitter
 */
export default class Job extends EventEmitter {
  /**
   * The unique identifier for the job, generated using the job's application name,
   * app name, controller name, and job name.
   *
   * @type {string}
   */
  uuid

  /**
   * Name of the application that the job is associated with.
   *
   * @type {string}
   */
  applicationName

  /**
   * Name of the app under which the job falls.
   *
   * @type {string}
   */
  appName

  /**
   * Name of the controller managing the job.
   *
   * @type {string}
   */
  controllerName

  /**
   * Unique name identifier for the job.
   *
   * @type {string}
   */
  name

  /**
   * The schedule for the job in cron format, or null if the job is not scheduled.
   * TODO: Deve ir para o worker
   *
   * @type {string|null}
   */
  schedule

  /**
   * Function definition that performs the actual job task.
   *
   * @type {Function}
   */
  jobFunction

  /**
   * Setup functions to be executed before the main job function.
   *
   * @type {Function[]}
   */
  setupFunctions = []

  /**
   * Teardown functions to be executed after the main job function.
   *
   * @type {Function[]}
   */
  teardownFunctions = []

  /**
   * The worker assigned to execute the job.
   * TODO: Jobs podem ter mais de um worker, remover esta refêrencia
   *
   * @type {Worker}
   */
  worker

  /**
   * Optional settings for the job.
   * TODO: Definir Options
   *
   * @type {object}
   */
  options

  /**
   *
   * @param      applicationName
   * @param      appName
   * @param      controllerName
   * @param      name
   * @param      schedule
   * @param      jobFunction
   * @param      options
   * @return {*}
   */

  /**
   *
   * @param root0
   * @param root0.applicationName
   * @param root0.appName
   * @param root0.controllerName
   * @param root0.name
   * @param root0.schedule
   * @param root0.jobFunction
   * @param root0.options
   */
  static create ({
    applicationName,
    appName,
    controllerName,
    name,
    schedule,
    jobFunction,
    options = {}
  }) {
    logger.info(`Creating job "${name}"`)

    const job = new this()
    job.applicationName = applicationName
    job.appName = appName
    job.controllerName = controllerName
    job.name = name
    job.schedule = schedule
    job.jobFunction = jobFunction
    job.options = options
    job.setUUID()

    // Force enumerable false to avoid problems reading the socket, which goes into an infinite loop (Cross Reference)
    Object.defineProperty(job, 'worker', {
      value: undefined,
      enumerable: false,
      writable: true,
      configurable: false
    })

    return job
  }

  /**
   * Sets UUID for the job
   *
   * @return {string} The generated UUID.
   */
  setUUID () {
    this.uuid = Job.createUUID(this.applicationName, this.appName, this.controllerName, this.name)
  }

  /**
   * Generates a unique UUID for the job based on its properties.
   *
   * CAUTION: If you change this method, many applications that depend on this uuid will break.
   *
   * @param  {string} applicationName
   * @param  {string} appName
   * @param  {string} controllerName
   * @param  {string} name
   *
   * @return {string}
   */
  static createUUID (applicationName, appName, controllerName, name) {
    const uniqueString = `${applicationName}${appName}${controllerName}${name}`

    const hash = crypto.createHash('sha256').update(uniqueString).digest('hex')
    return [
      hash.substring(0, 8),
      hash.substring(8, 12),
      hash.substring(12, 16),
      hash.substring(16, 20),
      hash.substring(20, 32)
    ].join('-')
  }

  /**
   * Starts the execution of a job. This involves spawning a child process
   * that executes the job's function.
   *
   * @return {Promise<void>} A promise that resolves when the job starts execution.
   * @static
   */
  async run () {
    if (!this.worker) {
      throw new Error(`Worker not defined in "${this.name}", cannot execute!`)
    }

    logger.info(`Running job: "${this.name}" Schedule: "${this.schedule}" Worker: "${this.worker.name}"`)
    await this.worker.run()
  }
}
