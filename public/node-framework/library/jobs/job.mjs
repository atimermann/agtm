/**
 *
 * **Created on 07/06/2023**
 *
 * @file job.mjs
 * Defines the Job class for managing tasks in the application. Jobs are units of work handled by workers.
 * This class provides functionalities to create, manage, and execute these tasks, extending from EventEmitter
 * for event-driven architecture. The Job class is central to the job management system of the application.
 *
 * @author André Timermann <andre@timermann.com.br>
 * @typedef {import('./worker.mjs').default} Worker - Represents the worker handling the job.
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
   * Creates a job instance.
   *
   * @static
   * @param  {object}   properties                  - An object containing job creation properties.
   * @param  {string}   properties.applicationName  - The application name.
   * @param  {string}   properties.appName          - The application name.
   * @param  {string}   properties.controllerName   - The controller name.
   * @param  {string}   properties.name             - The job name.
   * @param  {string}   properties.schedule         - The job schedule.
   * @param  {Function} properties.jobFunction      - The job function.
   * @param  {object}   [properties.options]        - Additional options.
   * @return {Job}                                  - The created job instance.
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
   * Generates and assigns a unique UUID to the job instance. The UUID is created using the job's
   * application name, app name, controller name, and job name. It's primarily used to uniquely
   * identify the job within the system.
   *
   * This method should be called during job creation to ensure each job has a distinct identifier.
   * It updates the 'uuid' property of the job instance.
   *
   * @return {void} Sets the 'uuid' property but does not return a value.
   */
  setUUID () {
    this.uuid = Job.createUUID(this.applicationName, this.appName, this.controllerName, this.name)
  }

  /**
   * Generates a unique UUID for the job based on its properties. This UUID is created using
   * a SHA-256 hash of a concatenation of the application name, app name, controller name, and
   * job name. The hashed value is then formatted as a standard UUID string. This method ensures
   * that each job has a distinct identifier based on its defining characteristics.
   *
   * CAUTION: If you change this method, many applications that depend on this UUID will break.
   * Changing the algorithm or the input format will result in different UUIDs being generated
   * for the same input parameters, potentially causing issues in systems that rely on the
   * consistency and uniqueness of these IDs.
   *
   * @param  {string} applicationName  - The name of the application to which the job belongs.
   * @param  {string} appName          - The name of the app within the application the job is associated with.
   * @param  {string} controllerName   - The name of the controller managing the job.
   * @param  {string} name             - The unique name identifier for the job.
   *
   * @return {string}                  The generated UUID string in the format "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
   *                                   where each 'x' is a hexadecimal character. This UUID is unique to the combination of the job's
   *                                   application name, app name, controller name, and job name.
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
