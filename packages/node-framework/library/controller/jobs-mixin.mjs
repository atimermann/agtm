/**
 * Created on 28/07/23
 *
 * library/controller/jobs-mixin.mjs
 *
 * @author André Timermann <andre@timermann.com.br>
 */
import createLogger from '../../library/logger.mjs'
import WorkerRunner from '../jobs/worker-runner.mjs'

import JobManager from '../jobs/job-manager.mjs'
import Job from '../jobs/job.mjs'
import Worker from '../jobs/worker.mjs'
import WorkerManager from '../jobs/worker-manager.mjs'

const logger = createLogger('Controller')

/**
 * Provides job-related functionality for extending classes.
 *
 * This mixin encapsulates logic related to job management and execution. Classes
 * that need job-related capabilities can extend this mixin to inherit its methods
 * and properties.
 *
 * @mixin
 *
 * @requires {string} Controller#appName          - Expected to be defined in the base class.
 * @requires {string} Controller#applicationName  - Expected to be defined in the base class.
 * @requires {string} Controller#controllerName   - Expected to be defined in the base class. *
 */
export default class JobsMixin {
  /**
   * Create a new job.
   *
   * @param {string}      name         - The name of the job.
   * @param {string|null} schedule     - The schedule for the job in cron format, or null if the job is not scheduled.
   * @param {Function}    jobFunction  - The function that will be executed when the job is processed.
   * @param {object}      [options]    - Optional settings for the job.
   * @throws {Error} If a job with the provided name already exists.
   */
  createJob (name, schedule, jobFunction, options = {}) {
    const newJob = Job.create({
      applicationName: this.applicationName,
      appName: this.appName,
      controllerName: this.controllerName,
      name,
      schedule,
      jobFunction,
      options
    })

    JobManager.addJob(newJob)
  }

  /**
   * Creates workers to process a given job
   *
   * @param {string} name     Nome do Grupo de workes
   * @param {string} jobName  Nome da tarefa que será processda
   * @param          options  Configuração dos workers
   */
  createWorkers (name, jobName, options) {
    const job = JobManager.getJob(this.applicationName, this.appName, this.controllerName, jobName)
    const newWorker = Worker.create({
      name,
      job,
      persistent: true,
      auto: false,
      options
    })

    WorkerManager.addWorker(newWorker)
  }

  /**
   * Sends data to the parent process, used as communication between the running job and the application
   *
   * @param {string} messageName
   * @param {object} message
   */
  sendMessage (messageName, message) {
    const messageData = {
      type: 'JOB_MESSAGE',
      messageName,
      message
    }
    console.log(JSON.stringify(messageData))
  }

  /**
   * @callback          onProcessDataCallback
   * @param    {any}    data                   - Data sent by the job.
   * @param    {Worker} worker                 - Worker instance that is managing the job.
   * @param    {object} jobProcess             - Information about the job process.
   * @param    {object} childProcess           - The child process object.
   */

  /**
   * Subscribes to a specified message from a child process, which is triggered via the `sendMessage` method.
   *
   * This is an alias for `WorkerManager.events.on('processMessage', async (worker, jobProcess, childProcess, messageName, message) => {...})`.
   *
   * @param {string}                messageName  - The name of the message to listen for. This is used to filter incoming messages.
   * @param {onProcessDataCallback} fn           - The callback function that will be invoked when the specified message is received.
   *
   * @example
   * onMessage('myMessage', (data, worker, jobProcess, childProcess) => {
   *  // Do something with the received data
   * });
   */
  onMessage (messageName, fn) {
    WorkerManager.events.on('processMessage', async (worker, jobProcess, childProcess, messageNameFromProcess, message) => {
      if (messageName === messageNameFromProcess) {
        fn(message, worker, jobProcess, childProcess)
      }
    })
  }

  /**
   * Defines a function that will be executed in all jobs in this controller when initializing the job
   *
   * @param {Function} jobSetupFunction  Function to be performed
   * @param {boolean}  allApplications   Runs on all jobs in all applications
   * @param {boolean}  allApps           Run all games from all apps in this application
   * @param {boolean}  allControllers    Executes all jobs on all controllers in this app
   */
  jobSetup (jobSetupFunction, allApplications = false, allApps = false, allControllers = false) {
    JobManager.setSetupFunction(
      jobSetupFunction,
      allApplications ? null : this.applicationName,
      allApps ? null : this.appName,
      allControllers ? null : this.controllerName
    )
  }

  /**
   * Defines a function that will be executed in all jobs after the job is finished
   * For persistent jobs, only when an error occurs
   *
   * @param {Function} jobTeardownFunction  Function to be performed
   * @param {boolean}  allApplications      Runs on all jobs in all applications
   * @param {boolean}  allApps              Run all games from all apps in this application
   * @param {boolean}  allControllers       Executes all jobs on all controllers in this app
   */
  jobTeardown (jobTeardownFunction, allApplications = false, allApps = false, allControllers = false) {
    JobManager.setTeardownFunction(
      jobTeardownFunction,
      allApplications ? null : this.applicationName,
      allApps ? null : this.appName,
      allControllers ? null : this.controllerName
    )
  }

  /**
   * Ends the execution of the job, it must always be called to perform finishing tasks.
   *
   * @param  {number}        exitCode
   * @return {Promise<void>}
   */
  async exit (exitCode = 0) {
    logger.debug(`Exiting controller "${this.completeIndentification}..."`)
    await WorkerRunner.exitProcess(exitCode)
  }

  /**
   * Loading jobs
   *
   * Optional abstract method, used for defining jobs.
   * Can be overridden in a subclass if custom job definitions are needed.
   */
  async jobs () {
    logger.debug(`No jobs configured in ${this.completeIndentification}.`)
  }
}
