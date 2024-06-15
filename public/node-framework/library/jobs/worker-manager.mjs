/**
 * Created on 04/07/2023
 *
 * @file packages/node-framework/library/jobs/worker-manager.mjs
 * Manager for workers that oversees the execution and monitoring of background jobs.
 *
 * @author André Timermann <andre@timermann.com.br>
 *
 * @typedef {import('./worker.mjs').default} Worker
 * @typedef {{ [key: string]: Worker }} WorkerDict
 *
 * TODO: Criar controle de processos zumbis
 * TODO: Parametrizar delay
 * TODO: Parametrizar options for workers
 */

/**
 * `run` event.
 *
 * @event WorkerManager#run
 *
 * @type {object}
 * @property {Worker} worker  - Worker who started new execution
 */

import createLogger from '../logger.mjs'
import { EventEmitter } from 'node:events'
import Worker from './worker.mjs'

const logger = createLogger('WorkerManager')

/**
 * Manages and oversees all workers.
 *
 * Note: A `Worker` in this context doesn't represent the job's execution,
 * but rather the entity executing a given job. It gets initialized,
 *
 * Events:
 * run
 * processError
 * processExit
 *
 * @fires WorkerManager#run
 */
export default class WorkerManager {
  /**
   * List of workers
   *
   * @type {Worker[]}
   */
  static workers = []

  /**
   * A dictionary of workers, indexed by their names.
   * It allows quick access to worker instances based on a unique string identifier.
   *
   * @type {WorkerDict}
   */
  static indexedWorkers = {}

  /**
   * Flag that indicates that workManager is in the verification phase
   * TODO: Validar necessidade
   *
   * @type {boolean}
   */
  static checking = false

  /**
   * EventEmitter
   *
   * @type {module:events.EventEmitter}
   */
  static events = new EventEmitter()

  /**
   * Starts Worker Manager.
   *
   * @return {Promise<void>}
   */
  static async init () {
    if (this.workers.length > 0) {
      await this.runPersistentWorkers()
      this.monitorWorkersHealth()
    }
  }

  /**
   * Adds a new Worker to the Worker Manager.
   *
   * @param {Worker} worker  - The Worker instance to add.
   *
   * @throws {Error} If a Worker with the same name already exists.
   */
  static addWorker (worker) {
    logger.info(`Add new Worker: ${worker}`)

    if (this.indexedWorkers[worker.name]) {
      throw new Error(`Worker "${worker.name}" already exists.`)
    }

    worker.on('run', () => {
      this.events.emit('run', worker)
    })

    worker.on('processRun', (jobProcess, childProcess) => {
      this.events.emit('processRun', worker, jobProcess, childProcess)
    })

    worker.on('processExit', (jobProcess, childProcess) => {
      this.events.emit('processExit', worker, jobProcess, childProcess)
    })

    worker.on('processLog', (jobProcess, childProcess, data) => {
      this.events.emit('processLog', worker, jobProcess, childProcess, data)
    })

    worker.on('processMessage', (jobProcess, childProcess, messageName, message) => {
      this.events.emit('processMessage', worker, jobProcess, childProcess, messageName, message)
    })

    this.workers.push(worker)
    this.indexedWorkers[worker.name] = worker
  }

  /**
   * Creates a new worker.
   *
   * @param  {string}  name        - The name of the worker.
   * @param  {object}  job         - The job associated with the worker.
   * @param  {boolean} persistent  - Whether the worker is persistent.
   * @param  {boolean} auto        - Indicates if the worker was automatically created.
   * @param  {object}  options     - The options for the worker.
   *
   * @return {Worker}              A new instance of a Worker, configured and ready to be added to the worker management system.
   */
  static createWorker (name, job, persistent, auto, options = {}) {
    const newWorker = Worker.create({
      name,
      job,
      persistent,
      auto,
      options
    })

    this.addWorker(newWorker)

    return newWorker
  }

  /**
   * Starts execution of persistent workers.
   *
   * @return {Promise<void>}
   */
  static async runPersistentWorkers () {
    for (const worker of this.workers) {
      if (worker.persistent) {
        await worker.run()
      }
    }
  }

  /**
   * Monitors workers health at regular intervals.
   */
  static monitorWorkersHealth () {
    // TODO: Parametrizar tempo de verificação
    setInterval(() => {
      this.verifyWorkersHealth()
    }, 30 * 1000) // verifica a cada 30 segundos
  }

  /**
   * Checks the health of all workers.
   */
  static verifyWorkersHealth () {
    if (this.checking) return

    logger.info('Checking Health')

    this.checking = true

    for (const worker of this.workers) {
      worker.checkHealth()
    }

    this.checking = false
  }

  /**
   * Returns worker information for monitoring.
   *
   * @return {WorkerDict} An object containing workers indexed by their names.
   */
  static getWorkersInformation () {
    return this.indexedWorkers
  }
}
