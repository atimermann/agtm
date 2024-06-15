/**
 * @file
 *
 * Represents a child process specifically for handling a job.
 * This class extends EventEmitter to emit custom events related to the job process lifecycle.
 * It manages the creation, monitoring, and termination of a Node.js child process used to execute a job.
 *
 * @author André Timermann
 *
 * @typedef {import('child_process').ForkOptions} ForkOptions
 * @typedef {import('child_process').ChildProcess} ChildProcess
 */
import createLogger from '../logger.mjs'
import { EventEmitter } from 'node:events'
import { fork } from 'node:child_process'
import { setTimeout as sleep } from 'node:timers/promises'

const logger = createLogger('WorkerManager')

/**
 * Represents a child process specifically for handling a job.
 * This class extends EventEmitter to emit custom events related to the job process lifecycle.
 * It manages the creation, monitoring, and termination of a Node.js child process used to execute a job.
 */
export default class JobProcessChild extends EventEmitter {
  /**
   * The child process instance created by the Node.js fork method.
   *
   * @type {ChildProcess}
   */
  process

  /**
   * The process identifier (PID) of the child process.
   *
   * @type {number}
   */
  pid

  /**
   * Unique identification of the execution based on the date
   * Related to the worker, worker can be executed several times, for example when restarting the application or when,
   * scheduling triggers new execution
   * In this case new runId is generated
   *
   * IMPORTANT: It is not related to the execution of the job-process, that is, if the job-process is restarted,
   * the runId remains the same, only if the worker is restarted
   *
   * @type {string}
   */
  runId

  /**
   * Timestamp indicating when the process was started.
   *
   * @type {Date}
   */
  startAt

  /**
   * The UNIX signal that resulted in the termination of the process, e.g., SIGINT.
   *
   * @type {string}
   */
  exitSignal

  /**
   * The exit code of the process. A non-zero code indicates an error or abnormal termination.
   *
   * @type {number}
   */
  exitCode

  /**
   * Indicates whether the process has been terminated.
   *
   * @type {boolean}
   */
  killed = false

  /**
   * Factory method to create a new JobProcessChild instance. Initializes the child process using the Node.js fork method.
   *
   * @param  {string}          modulePath  - The module path to run in the child process.
   * @param  {string[]}        args        - Arguments to pass to the child process.
   * @param  {ForkOptions}     options     - Fork options.
   * @param  {string}          runId       - Unique identifier for the job run.
   *
   * @return {JobProcessChild}             The created JobProcessChild instance.
   */
  static create (modulePath, args, options, runId) {
    const jobProcessChild = new this()
    jobProcessChild.process = fork(modulePath, args, options)
    jobProcessChild.runId = runId
    jobProcessChild.startAt = new Date()
    jobProcessChild.pid = jobProcessChild.process.pid

    jobProcessChild.setupEvents()

    return jobProcessChild
  }

  /**
   * Sets up event listeners for the child process's standard output, standard error, and exit events.
   */
  setupEvents () {
    this.process.stdout.on('data', (data) => {
      this.emit('log', data)
    })

    this.process.stderr.on('data', (data) => {
      this.emit('log', data)
    })

    this.process.once('exit', (code, signal) => {
      this.running = false
      this.exitCode = code
      this.exitSignal = signal

      this.emit('exit')
      this.exit()
    })
  }

  /**
   * Terminates the process and cleans up event listeners. Logs warning messages with exit details.
   */
  exit () {
    this.killed = true
    this.removeAllListeners()
    logger.warn(`Process pid "${this.pid}", runId "${this.runId}" Killed!! Code: ${this.exitCode} Signal: ${this.exitSignal}"`)
  }

  /**
   * Attempts to terminate the child process. It sends different termination signals progressively
   * and waits for a specified time between signals to allow for graceful shutdown.
   *
   * @param  {number}        killWaitTime  - The time in milliseconds to wait after sending each kill signal.
   * @return {Promise<void>}
   */
  async kill (killWaitTime) {
    // Send SIGNIT
    await this.#sendKill('SIGINT', killWaitTime)
    if (this.killed || !this.process.connected) return

    await this.#sendKill('SIGTERM', killWaitTime)
    if (this.killed || !this.process.connected) return

    await this.#sendKill('SIGKILL', killWaitTime)
    if (this.killed || !this.process.connected) return

    this.emit('stuck')
    this.exit()
  }

  /**
   * Sends a specific kill signal to the child process and waits for a defined period to allow the process to terminate gracefully.
   *
   * @param {'SIGINT'|'SIGTERM'|'SIGKILL'} signal        - The UNIX signal to send to the process (SIGINT, SIGTERM, or SIGKILL).
   * @param {number}                       killWaitTime  - Time in milliseconds to wait for the process to terminate.
   */
  async #sendKill (signal, killWaitTime) {
    logger.warn(`SEND KILL... PID: "${this.process.pid}" SIGNAL: "${signal}"`)
    this.process.kill(signal)
    await sleep(killWaitTime)
  }
}
