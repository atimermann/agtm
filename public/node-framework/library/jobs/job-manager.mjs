/**
 * **Created on 07/06/2023**
 *
 * @file job-manager.mjs
 *
 * Manages job scheduling and execution within the application. It loads, initializes, and runs jobs,
 * handling their setup and teardown functions. It also provides utilities to retrieve and monitor
 * job information and to enable or disable jobs based on application, app, and controller configurations.
 *
 * @author André Timermann <andre@timermann.com.br>
 *
 * @typedef {import('../application.mjs').default} Application
 * @typedef {import('./../controller/jobs.mjs').default} JobsController
 * @typedef {{ [key: string]: Job }} JobDict
 */

/**
 * @typedef {Function} JobFunction
 * A specialized function type for job setup or teardown functions. These functions are scoped to
 * specific application components and have a type indicating whether they are for setup or teardown.
 * @property {number} type  - The type of function, either SETUP_FUNCTION (0) or TEARDOWN_FUNCTION (1).
 */

/**
 * @typedef {object} JobSetupAndTeardownFunction
 * Represents a setup or teardown function along with its scope.
 * This type is used for objects that define a function to run during job setup or teardown,
 * and includes the scope (application, app, and controller names) to which the function applies.
 * @property {JobFunction} [jobSetupFunction]     - The function to run during job setup or teardown.
 * @property {JobFunction} [jobTeardownFunction]  - The function to run during job teardown.
 * @property {string}      applicationName        - The name of the application to scope the setup or teardown function to.
 * @property {string}      appName                - The name of the app to scope the setup or teardown function to.
 * @property {string}      controllerName         - The name of the controller to scope the setup or teardown function to.
 * @property {number}      type                   - The type of function, either setup or teardown, indicated by a constant like SETUP_FUNCTION or TEARDOWN_FUNCTION.
 */

import cron from 'node-cron'
import WorkerManager from './worker-manager.mjs'
import Config from '../config.mjs'
import cloneDeep from 'lodash/cloneDeep.js'
import createLogger from '../logger.mjs'
import Job from './job.mjs'
import { EventEmitter } from 'node:events'

const logger = createLogger('JobManager')

const applicationEnabled = Config.get('jobManager.applicationsEnabled', 'array')
const appsEnabled = Config.get('jobManager.appsEnabled', 'array')
const controllersEnabled = Config.get('jobManager.controllersEnabled', 'array')

const SETUP_FUNCTION = 1
const TEARDOWN_FUNCTION = 2

/**
 * Manages and schedules jobs for execution.
 */
export default class JobManager {
  /**
   * A static object property holding a collection of all jobs managed by the system.
   * The jobs are stored in key-value pairs, where each key is a unique hash generated
   * for the job and the value is the job's details.
   *
   * @type {JobDict} Holds all managed jobs, keyed by their unique UUID.
   */
  static jobs = {}

  /**
   * Used for setting up or tearing down jobs. Each object in the array specifies a function to be
   * executed during the setup or teardown phase of a job, along with the scope (application, app,
   * and controller names) to which the function applies. This allows the system to know which functions
   * to execute for each job based on its scope.
   *
   * @type {JobSetupAndTeardownFunction[]} A list of functions and their associated scope information
   */
  static jobSetupAndTeadDownFunctions = []

  static events = new EventEmitter()

  /**
   * Loads and initializes jobs and workers from the provided application context.
   *
   * @param  {Application}   application  - The application context to load jobs from.
   * @return {Promise<void>}              Resolves when all jobs and workers are loaded.
   */
  static async load (application) {
    await this.#loadJobsAndWorkersFromController(application)
    this.#configureSetupAndTeardownFunctions()
  }

  /**
   * Initializes the Job Manager. This involves setting up the worker environment
   * and starting the job schedules.
   *
   * @param  {Application}   application  - The application context within which the job manager operates.
   *
   * @return {Promise<void>}              A promise that resolves when the Job Manager has been initialized.
   */
  static async run (application) {
    logger.info('Initializing...')
    await this.load(application)

    this.#createScheduledWorkers()

    await this.#startScheduleJob()
    await WorkerManager.init()
  }

  /**
   * Registers a function to run during job setup for specified application components.
   *
   * @param {Function} jobSetupFunction  - The function to run during job setup.
   * @param {string}   applicationName   - The name of the application to scope the setup function to.
   * @param {string}   appName           - The name of the app to scope the setup function to.
   * @param {string}   controllerName    - The name of the controller to scope the setup function to.
   */
  static setSetupFunction (jobSetupFunction, applicationName, appName, controllerName) {
    this.jobSetupAndTeadDownFunctions.push({
      type: SETUP_FUNCTION,
      jobSetupFunction,
      applicationName,
      appName,
      controllerName
    })
  }

  /**
   * Registers a function to run during job teardown for specified application components.
   *
   * @param {Function} jobTeardownFunction  - The function to run during job teardown.
   * @param {string}   applicationName      - The name of the application to scope the teardown function to.
   * @param {string}   appName              - The name of the app to scope the teardown function to.
   * @param {string}   controllerName       - The name of the controller to scope the teardown function to.
   */
  static setTeardownFunction (jobTeardownFunction, applicationName, appName, controllerName) {
    this.jobSetupAndTeadDownFunctions.push({
      type: TEARDOWN_FUNCTION,
      jobTeardownFunction,
      applicationName,
      appName,
      controllerName
    })
  }

  /**
   * Adds a new job to the manager.
   *
   * @param {Job} job  - The job to add.
   */
  static addJob (job) {
    logger.info(`Add new Job: ${job.name}`)

    if (this.jobs[job.name]) {
      throw new Error(`Job "${job.name}" already exists.`)
    }

    this.jobs[job.uuid] = job
    logger.info(`Loading Job: "${job.name}" UUID:  ${job.uuid}`)
  }

  /**
   * Checks if a job is active based on application, app, and controller settings.
   *
   * @param  {JobsController} controller  - The controller the job belongs to.
   * @return {boolean}                    True if the job is enabled; false otherwise.
   */
  static #isJobEnabled (controller) {
    if (applicationEnabled && (!Array.isArray(applicationEnabled) || !applicationEnabled.includes(controller.applicationName))) {
      logger.info(`Application "${controller.applicationName}" disabled!`)
      return false
    }
    if (appsEnabled && (!Array.isArray(appsEnabled) || !appsEnabled.includes(controller.appName))) {
      logger.info(`App "${controller.appName}" disabled!`)
      return false
    }
    if (controllersEnabled && (!Array.isArray(controllersEnabled) || !controllersEnabled.includes(controller.controllerName))) {
      logger.info(`Controller "${controller.controllerName}" disabled!`)
      return false
    }
    return true
  }

  /**
   * Retrieves a Job instance from worker attributes. This involves searching through
   * the static job collection and returning the job that matches the given attributes.
   *
   * @param  {string} applicationName  - The name of the application the job is associated with.
   * @param  {string} appName          - The name of the app under which the job falls.
   * @param  {string} controllerName   - The name of the controller managing the job.
   * @param  {string} name             - The name of the job.
   *
   * @return {Job}                     The job instance that matches the given attributes.
   */
  static getJob (applicationName, appName, controllerName, name) {
    const jobUUID = Job.createUUID(applicationName, appName, controllerName, name)

    const job = this.getJobByUUID(jobUUID)

    if (!job) {
      const availableJobs = ['Available jobs:']
      for (const [, jobElement] of Object.entries(this.jobs)) {
        availableJobs.push(`- ${this.#quoteIfNeeded(jobElement.applicationName)} ${this.#quoteIfNeeded(jobElement.appName)} ${this.#quoteIfNeeded(jobElement.controllerName)} ${this.#quoteIfNeeded(jobElement.name)}`)
      }
      throw new Error(`Job "${name}" does not exist in the Application "${applicationName}", App: "${appName}", Controller: "${controllerName}"\n${availableJobs.join('\n')}`)
    }

    return job
  }

  /**
   * Wraps a string in double quotes if it contains spaces or special characters,
   * escaping any internal double quotes. Useful for shell command preparation.
   *
   * @param  {string} str  - String to potentially quote.
   * @return {string}      - Quoted string with escaped double quotes, or original string if no quoting needed.
   */
  static #quoteIfNeeded (str) {
    if (/[\s"']/.test(str)) {
      return `"${str.replace(/"/g, '\\"')}"`
    }
    return str
  }

  /**
   * Retrieves a Job instance by its UUID.
   *
   * This method looks up a job in the stored jobs collection using the provided UUID. If a job with the given
   * UUID exists, it returns the corresponding Job instance. This is useful for operations where you have a job's
   * UUID and need to retrieve its full details or interact with the job object.
   *
   * @param  {string} uuid  - The UUID of the job to retrieve.
   * @return {Job}          The Job instance that corresponds to the provided UUID, or undefined if no such job exists.
   */
  static getJobByUUID (uuid) {
    return this.jobs[uuid]
  }

  /**
   * Returns information about all managed jobs for monitoring purposes. This method collects
   * data about each job and its associated workers, including their states and configurations.
   * It's particularly useful for understanding the system's current operational status and for
   * debugging or monitoring purposes.
   *
   * Note: Currently, this method assumes there's only one worker per job. If there are multiple
   * workers for a job, it will only consider the last one. Further development is needed to
   * handle multiple workers per job adequately.
   *
   * TODO: Handle multiple workers per job appropriately.
   *
   * @return {JobDict} An object containing detailed information about each job. The keys
   *                   are the job UUIDs, and the values are objects containing job details and worker information.
   */
  static getJobsInformation () {
    const clonedJobs = cloneDeep(this.jobs)

    const workers = WorkerManager.getWorkersInformation()

    // Associates job with the list of workers that process it
    Object.keys(workers).forEach((key) => {
      const worker = workers[key]

      if (!worker.job) return

      // TODO: relationJob não é job, é um job com dados a mais, criar classe/objet/typedef de relationJob

      const relationJob = clonedJobs[worker.job.uuid]

      // Init Vars
      if (!relationJob.workers) relationJob.workers = []
      if (relationJob.concurrency === undefined) relationJob.concurrency = 0

      if (!relationJob) return

      if (worker.auto) {
        relationJob.workers.push('-')
      } else {
        relationJob.workers.push(worker.name)
      }

      relationJob.persistent = worker.persistent

      // Adiciona apenas o ultimo
      relationJob.concurrency = worker.options?.concurrency
      if (relationJob.concurrency === undefined) {
        relationJob.concurrency = 1
      }

      // Status
      worker.jobProcesses.length === 0
        ? relationJob.status = 'Aguardando'
        : relationJob.status = `Executando[${worker.jobProcesses.length}]`
    })

    return clonedJobs
  }

  /**
   * Configures setup and teardown functions for all system jobs according to application, app and controller.
   *
   */
  static #configureSetupAndTeardownFunctions () {
    for (const [, job] of Object.entries(this.jobs)) {
      const jobSetupAndTeadDownFunctions = this.#filterFunctiontoJob(job)

      for (const jobSetupAndTeadDownFunction of jobSetupAndTeadDownFunctions) {
        if (jobSetupAndTeadDownFunction.type === SETUP_FUNCTION) {
          job.setupFunctions.push(jobSetupAndTeadDownFunction.jobSetupFunction)
        } else if (jobSetupAndTeadDownFunction.type === TEARDOWN_FUNCTION) {
          job.teardownFunctions.push(jobSetupAndTeadDownFunction.jobTeardownFunction)
        }
      }
    }
  }

  /**
   * Filters the list of setup and teardown functions to find those that are applicable to a specific job.
   * It checks the job's application name, app name, and controller name against each setup and teardown
   * function's intended scope. Only functions that match or have no specified scope for these parameters
   * are considered applicable and returned.
   *
   * This method is used internally to associate the correct setup and teardown functions with each job
   * based on its scope. It's essential for ensuring that jobs are initialized and cleaned up correctly
   * according to their specific requirements and the system's configuration.
   *
   * @param  {Job}                                job  - The job to filter setup and teardown functions for.
   * @return {Array<JobSetupAndTeardownFunction>}      An array of setup and teardown functions applicable to the given job.
   */
  static #filterFunctiontoJob (job) {
    return this.jobSetupAndTeadDownFunctions.filter(jobSetupFunction => {
      if (jobSetupFunction.applicationName && jobSetupFunction.applicationName !== job.applicationName) {
        return false
      }
      if (jobSetupFunction.appName && jobSetupFunction.appName !== job.appName) {
        return false
      }
      // noinspection RedundantIfStatementJS
      if (jobSetupFunction.controllerName && jobSetupFunction.controllerName !== job.controllerName) {
        return false
      }
      return true
    })
  }

  /**
   * Creates workers for all the jobs that have been scheduled. Each job is assigned a worker
   * that will be responsible for executing the job as per its schedule.
   *
   *
   */
  static #createScheduledWorkers () {
    for (const [, job] of Object.entries(this.jobs)) {
      if (job.schedule) {
        job.worker = WorkerManager.createWorker(`${job.name}-${job.uuid}`, job, false, true, {})
      }
    }
  }

  /**
   * Loads the job and worker details from the user-defined application context.
   * This involves scanning through all the controllers and extracting the job details.
   *
   * @param  {Application}   application  - The application context within which to find the jobs.
   *
   * @return {Promise<void>}              A promise that resolves when all jobs and workers have been loaded.
   */
  static async #loadJobsAndWorkersFromController (application) {
    logger.info('Loading jobs and Workers from controllers...')

    for (const controller of application.getControllers('jobs')) {
      logger.info(`Loading "${controller.completeIndentification}"...`)
      if (!this.#isJobEnabled(controller)) continue
      await controller.setup()
    }
  }

  /**
   * Starts all the scheduled jobs. This involves initiating the execution of each job
   * as per its predefined schedule.
   *
   * @return {Promise<void>} A promise that resolves when all scheduled jobs have started execution.
   */
  static async #startScheduleJob () {
    const promises = []
    for (const [, job] of Object.entries(this.jobs)) {
      if (job.schedule) {
        if (job.schedule === 'now') {
          promises.push(job.run())
        } else if (job.schedule) {
          promises.push(this.#schedulingJob(job))
        }
      }
    }
    await Promise.all(promises)
  }

  /**
   * Schedules a job to run at predefined intervals. This involves creating a cron job
   * that triggers the job execution as per its schedule.
   *
   * @param  {Job}           job  - The job object that needs to be scheduled.
   * @return {Promise<void>}      A promise that resolves when the job has been scheduled.
   */
  static async #schedulingJob (job) {
    cron.schedule(job.schedule, async () => {
      try {
        await job.run()
      } catch (error) {
        console.error(error)
      }
    }, {
      scheduled: true,
      timezone: Config.get('httpServer.timezone')
    })
  }
}
