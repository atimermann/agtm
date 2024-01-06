/**
 *
 */
export default class JobProcessChild extends EventEmitter {
    /**
     *
     * @param modulePath
     * @param args
     * @param options
     * @param runId
     */
    static create(modulePath: any, args: any, options: any, runId: any): JobProcessChild;
    /**
     * The child process instance created by the Node.js fork method.
     *
     * @type {import('child_process').ChildProcess}
     */
    process: import('child_process').ChildProcess;
    /**
     * process pid
     *
     * @type {number}
     */
    pid: number;
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
    runId: string;
    /**
     * Process start time
     *
     * @type {Date}
     */
    startAt: Date;
    /**
     * The UNIX signal that was triggered when the process was terminated, e.g., SIGINT.
     *
     * @type {string}
     */
    exitSignal: string;
    /**
     * The exit code of the UNIX process. Any code other than 0 indicates an error.
     *
     * @type {number}
     */
    exitCode: number;
    /**
     * If this process is dead
     *
     * @type {boolean}
     */
    killed: boolean;
    /**
     *
     */
    setupEvents(): void;
    running: boolean;
    /**
     * Finaliza processo e remove todos os eventos
     */
    exit(): void;
    /**
     * Try to kill the process
     *
     * @param                  killWaitTime
     * @return {Promise<void>}
     */
    kill(killWaitTime: any): Promise<void>;
    /**
     * Sends a specified kill signal to the child process and waits for a set period (defined by killWaitTime)
     * before returning to allow for potential process cleanup.
     *
     * @param {NodeJS.Signals} signal        - The UNIX signal to send to the process (SIGINT, SIGTERM, or SIGKILL).
     * @param {number}         killWaitTime  - Time in milliseconds to wait for the process to die
     * @async
     * @private
     */
    private _sendKill;
}
import { EventEmitter } from 'node:events';
//# sourceMappingURL=job-process-child.d.mts.map