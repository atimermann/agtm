/**
 * Represents a child process specifically for handling a job.
 * This class extends EventEmitter to emit custom events related to the job process lifecycle.
 * It manages the creation, monitoring, and termination of a Node.js child process used to execute a job.
 */
export default class JobProcessChild extends EventEmitter {
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
    static create(modulePath: string, args: string[], options: ForkOptions, runId: string): JobProcessChild;
    /**
     * The child process instance created by the Node.js fork method.
     *
     * @type {ChildProcess}
     */
    process: ChildProcess;
    /**
     * The process identifier (PID) of the child process.
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
     * Timestamp indicating when the process was started.
     *
     * @type {Date}
     */
    startAt: Date;
    /**
     * The UNIX signal that resulted in the termination of the process, e.g., SIGINT.
     *
     * @type {string}
     */
    exitSignal: string;
    /**
     * The exit code of the process. A non-zero code indicates an error or abnormal termination.
     *
     * @type {number}
     */
    exitCode: number;
    /**
     * Indicates whether the process has been terminated.
     *
     * @type {boolean}
     */
    killed: boolean;
    /**
     * Sets up event listeners for the child process's standard output, standard error, and exit events.
     */
    setupEvents(): void;
    running: boolean;
    /**
     * Terminates the process and cleans up event listeners. Logs warning messages with exit details.
     */
    exit(): void;
    /**
     * Attempts to terminate the child process. It sends different termination signals progressively
     * and waits for a specified time between signals to allow for graceful shutdown.
     *
     * @param  {number}        killWaitTime  - The time in milliseconds to wait after sending each kill signal.
     * @return {Promise<void>}
     */
    kill(killWaitTime: number): Promise<void>;
    #private;
}
export type ForkOptions = import('child_process').ForkOptions;
export type ChildProcess = import('child_process').ChildProcess;
import { EventEmitter } from 'node:events';
//# sourceMappingURL=job-process-child.d.mts.map