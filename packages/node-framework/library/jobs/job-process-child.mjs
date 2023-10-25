/**
 *
 *
 */
import createLogger from '../logger.mjs'
import { EventEmitter } from 'node:events'
import { fork } from 'node:child_process'
import { setTimeout as sleep } from 'node:timers/promises'

const logger = createLogger('WorkerManager')

export default class JobProcessChild extends EventEmitter {
  /**
   *  The child process instance created by the Node.js fork method.
   * @type {import('child_process').ChildProcess}
   */
  process

  /**
   * process pid
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
   * The UNIX signal that was triggered when the process was terminated, e.g., SIGINT.
   * @type {string}
   */
  exitSignal

  /**
   * The exit code of the UNIX process. Any code other than 0 indicates an error.
   * @type {number}
   */
  exitCode

  /**
   * If this process is dead
   *
   * @type {boolean}
   */
  killed = false

  static create (modulePath, args, options, runId) {
    const jobProcessChild = new this()
    jobProcessChild.process = fork(modulePath, args, options)
    jobProcessChild.runId = runId
    jobProcessChild.pid = jobProcessChild.process.pid

    jobProcessChild.setupEvents()

    return jobProcessChild
  }

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
   * Finaliza processo e remove todos os eventos
   */
  exit () {
    this.killed = true
    this.removeAllListeners()
    logger.warn(`Process pid "${this.pid}", runId "${this.runId}" Killed!! Code: ${this.exitCode} Signal: ${this.exitSignal}"`)
  }

  /**
   * Try to kill the process
   *
   * @param killWaitTime
   * @returns {Promise<void>}
   */
  async kill (killWaitTime) {
    // Send SIGNIT
    await this._sendKill('SIGINT', killWaitTime)
    if (this.killed || !this.process.connected) return

    await this._sendKill('SIGTERM', killWaitTime)
    if (this.killed || !this.process.connected) return

    await this._sendKill('SIGKILL', killWaitTime)
    if (this.killed || !this.process.connected) return

    this.emit('stuck')
    this.exit()
  }

  /**
   * Sends a specified kill signal to the child process and waits for a set period (defined by killWaitTime)
   * before returning to allow for potential process cleanup.
   *
   * @param {NodeJS.Signals} signal - The UNIX signal to send to the process (SIGINT, SIGTERM, or SIGKILL).
   * @param {number}  killWaitTime  - Time in milliseconds to wait for the process to die
   * @async
   * @private
   */
  async _sendKill (signal, killWaitTime) {
    logger.warn(`SEND KILL... PID: "${this.process.pid}" SIGNAL: "${signal}"`)
    this.process.kill(signal)
    await sleep(killWaitTime)
  }
}
