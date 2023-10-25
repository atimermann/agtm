/**
 * JobProcess class is responsible for handling the individual processes of a job.
 * Each instance of this class represents a running job process, encapsulating details such as
 * the process ID, its worker, runtime options, and state indicators (like whether it's running or being terminated).
 *
 * This class extends EventEmitter to allow monitoring and reacting to different states of the job process through various events.
 *
 * @typedef {import('./worker.mjs').default} Worker
 *
 * @class
 * @extends EventEmitter
 *
 * @file library/jobs/job-process.mks.mjs
 * @author André Timermann <andre@timermann.com.br>
 * @created 08/09/23
 */
import createLogger from '../logger.mjs'
import { EventEmitter } from 'node:events'
import JobProcessChild from './job-process-child.mjs'

const logger = createLogger('WorkerManager')

export default class JobProcess extends EventEmitter {
  /**
   * JobProcess instance ID, relative to the number of instances defined in the worker
   * @type {number}
   */
  instance

  /**
   * The worker instance that owns this process.
   *
   * @type {Worker}
   */
  worker

  /**
   * Counter keeping track of the number of times the process was terminated due to errors.
   * @type {number}
   */
  exitOnErrorCount = 0

  /**
   * Indicates if the process is in the process of being terminated
   * @type {boolean}
   */
  killing = false

  /**
   * Indicates if the process is currently running.
   * @type {boolean}
   */
  running = false

  /**
   * Configuration options for process execution.
   *
   * @type {{silent: boolean}}
   */
  options = {
    /**
     * Silent Log
     */
    silent: true,
    /**
     * Time to wait to kill the process
     */
    killWaitTime: 5000
  }

  /**
   * Classe que representa o processo em execução
   * @type {JobProcessChild}
   */
  childProcess

  /**
   * Factory method to create a new JobProcess instance, set its properties, and initiate the process.
   *
   * @param {Worker} worker - The worker that owns this process.
   * @param {number} instance - A unique identifier for this process.
   * @param {Object} options - Additional options for this process.
   *
   * @returns {JobProcess} - A new JobProcess instance.
   */
  static create (worker, instance, options = {}) {
    const process = new this()
    process.instance = instance
    process.options = { ...process.options, ...options }
    process.worker = worker
    process.runId = worker.runId

    return process
  }

  /**
   * Initiates the process. Configures and starts a child process using the node.js fork method.
   * Logs the initiation details including the worker name, job name, and process ID.
   */
  run () {
    logger.info(`Running process: Worker: "${this.worker.name}" Job: "${this.worker.job.name}" Process: "#${this.instance}"}`)

    const args = [
      'job',
      this.worker.job.applicationName,
      this.worker.job.appName,
      this.worker.job.controllerName,
      this.worker.job.name
    ]

    this.childProcess = JobProcessChild.create(
      './src/run.mjs',
      args,
      { silent: this.options.silent },
      this.worker.runId
    )

    this.childProcess.on('log', data => {
      const childLogger = createLogger(`Job ${this.worker.job.name} #${this.instance}`)

      for (const line of data.toString().split('\n')) {
        try {
          const logObj = JSON.parse(line)
          const logModule = logObj.module ? `[${logObj.module}] ` : ''
          childLogger[logObj.level](`${logModule}${logObj.message}`)
          this.emit('log', this.childProcess, line)
        } catch (err) {
          // Generic messages without JSON format are treated as warnings
          if (line !== '') {
            childLogger.warn(line)
            this.emit('log', this.childProcess, JSON.stringify({
              level: 'warn',
              message: line
            }))
          }
        }
      }
    })

    this.childProcess.on('exit', () => {
      if (this.childProcess.exitCode !== 0) {
        this.exitOnErrorCount++
      }

      this.emit('exit', this.childProcess)
      this.running = false
    })

    this.running = true

    this.emit('run', this.childProcess)
  }

  /**
   * Restarts the process if it's not currently being killed. If the process is running or connected,
   * it will attempt to kill it before restarting.
   *
   * @async
   */
  async restart () {
    if (this.killing) {
      logger.warn(`Job killing! Waiting... Worker: "${this.worker.name}" Job: "${this.worker.job.name}"`)
      return
    }
    if (this.running || (this.childProcess && this.childProcess.process.connected)) {
      await this._killAndRun()
    } else {
      this.run()
    }
  }

  /**
   * Checks the health of the process. This method logs the current status of the process,
   * and restarts it if it is found to be hanging (not running).
   *
   */
  checkHealth () {
    // console.log('[WorkerManager]', )
    logger.debug(`Checking process #${this.instance} Pid:#${this.childProcess?.pid} Running:${this.running} Connected:${this.childProcess?.process?.connected}`)

    // Checks if Job is stopped
    if (this.running === false) {
      logger.error(`Process hangout: Worker: "${this.worker.name}" Job: "${this.worker.job.name}" Process: "#${this.instance}"}`)
      this.run()
    }

    // TODO: Se ruunning = true, significa que o processo não envirou exit signal, verificar e nviar emit(exit)

    // TODO: Verifica se Job está respondendo ping/pong (com timeout)

    // TODO: Veriica se job está conectado

    // TODO: Verifica consumo de memoria do Job

    // TODO: Verifica jobs está reiniciando muits vezes
  }

  /**
   * Handle the process termination and subsequent restart.
   * It sequentially sends SIGINT, SIGTERM, and SIGKILL signals to the process with a pause
   * between each signal to allow for graceful termination.
   *
   * @async
   * @private
   */
  async _killAndRun () {
    this.killing = true

    logger.warn(`Killing job: "${this.worker.job.name}" Worker:"${this.worker.name}" Instance: "#${this.instance}"`)

    // Prepares callback to restart the process when finished.
    this.childProcess.once('exit', async () => {
      logger.warn(`Killing successful: "${this.worker.job.name}" Worker:"${this.worker.name}" Instance: "#${this.instance}" `)
      this.run()
      this.killing = false
    })

    this.childProcess.once('stuck', async () => {
      logger.error(`Process is stuck. It cannot be killed. Restart aborted. Job: "${this.worker.job.name}" Worker:"${this.worker.name}" PID: "${this.childProcess.pid}"`)
      // TODO: Controle de zumbi
      this.killing = false
    })

    await this.childProcess.kill(this.options.killWaitTime)
  }
}
