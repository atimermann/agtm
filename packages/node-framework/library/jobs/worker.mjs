/**
 * **Created on 07/06/2023**
 *
 * library/jobs/worker.mjs
 * @author André Timermann <andre@timermann.com.br>
 *
 *   @typedef {import('./job-process.mjs').default} JobProcess
 *   @typedef {import('./job.mjs').default} Job
 *
 *
 */

/**
 *  `run` event.
 *
 * @event WorkerManager#run *
 * @type {object}
 *
 * @fires WorkerManager#run
 */

import createLogger from '../logger.mjs'
import { EventEmitter } from 'node:events'
import JobProcess from './job-process.mjs'
import { generateUniqueIdByDate } from '@agtm/util'
const logger = createLogger('WorkerManager')

/**
 * Manages the executions of a given job
 *
 *  Events:
 *    run - Fired whenever a new worker execution starts
 *    exit - Fired when process is finished
 */
export default class Worker extends EventEmitter {
  /**
   * The name of the worker.
   *
   * @type {string}
   */
  name

  /**
   * The job associated with the worker.
   * @type {Job}
   */
  job

  /**
   * Whether the worker is persistent.
   * @type {boolean}
   */
  persistent

  /**
   * If the worker was created automatically by the manager
   * @type {boolean}
   */
  auto

  /**
   * The options for the worker.
   * @type {{}}
   */
  options = {}

  /**
   *  List of processes that are running the job
   *  @type {JobProcess[]}
   */
  jobProcesses = []

  /**
   * Unique identification of the execution based on the date
   * @type {string}
   */
  runId

  /**
   *  Instantiate a new worker
   *
   * @param name
   * @param job
   * @param persistent
   * @param auto
   * @param options
   * @returns {Worker}
   */
  static create ({
    name,
    job,
    persistent,
    auto,
    options = {}
  }) {
    logger.info(`Creating worker: "${name}" Job: "${job.name}" Persistent: "${persistent}" Schedule: "${job.schedule}"`)

    const worker = new this()
    worker.name = name
    worker.job = job
    worker.persistent = persistent
    worker.auto = auto
    worker.options = options

    return worker
  }

  /**
   * Run processes from this worker
   *
   * @returns {Promise<void>}
   */
  async run () {
    this.runId = generateUniqueIdByDate()
    this.emit('run')

    if (this.jobProcesses.length > 0) {
      logger.info(`Restarting Worker: "${this.name}" Job: "${this.job.name}" Persistent: "${this.persistent}"`)
      await this.restartProcesses()
    } else {
      const concurrency = this.options.concurrency || 1
      logger.info(`Starting Worker: "${this.name}" Job: "${this.job.name}" Persistent: "${this.persistent}" Concurrency: ${concurrency}`)
      for (let i = 1; i <= concurrency; i++) {
        const jobProcess = JobProcess.create(this, i, this.options)

        jobProcess.on('run', childProcess => {
          this.emit('processRun', jobProcess, childProcess)
        })

        jobProcess.on('log', (childProcess, data) => {
          this.emit('processLog', jobProcess, childProcess, data)
        })

        jobProcess.on('exit', childProcess => {
          this.emit('processExit', jobProcess, childProcess)
        })

        this.jobProcesses.push(jobProcess)
        jobProcess.run()
      }
    }
  }

  /**
   * Restart jobs for a specific worker.
   */
  async restartProcesses () {
    for (const jobProcess of this.jobProcesses) {
      await jobProcess.restart()
    }
  }

  /**
   * Checks the health of processes (if they are running)
   */
  checkHealth () {
    if (this.persistent) {
      for (const jobProcess of this.jobProcesses) {
        jobProcess.checkHealth()
      }
    }
  }
}
