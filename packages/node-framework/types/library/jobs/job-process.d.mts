/**
 *
 */
export default class JobProcess extends EventEmitter {
    /**
     * Factory method to create a new JobProcess instance, set its properties, and initiate the process.
     *
     * @param  {Worker}     worker    - The worker that owns this process.
     * @param  {number}     instance  - A unique identifier for this process.
     * @param  {object}     options   - Additional options for this process.
     *
     * @return {JobProcess}           - A new JobProcess instance.
     */
    static create(worker: Worker, instance: number, options?: object): JobProcess;
    /**
     * JobProcess instance ID, relative to the number of instances defined in the worker
     *
     * @type {number}
     */
    instance: number;
    /**
     * The worker instance that owns this process.
     *
     * @type {Worker}
     */
    worker: Worker;
    /**
     * Counter keeping track of the number of times the process was terminated due to errors.
     *
     * @type {number}
     */
    exitOnErrorCount: number;
    /**
     * Indicates if the process is in the process of being terminated
     *
     * @type {boolean}
     */
    killing: boolean;
    /**
     * Indicates if the process is currently running.
     *
     * @type {boolean}
     */
    running: boolean;
    /**
     * Configuration options for process execution.
     *
     * @type {{silent: boolean}}
     */
    options: {
        silent: boolean;
    };
    /**
     * Classe que representa o processo em execução
     *
     * @type {JobProcessChild}
     */
    childProcess: JobProcessChild;
    /**
     * Initiates the process. Configures and starts a child process using the node.js fork method.
     * Logs the initiation details including the worker name, job name, and process ID.
     */
    run(): void;
    /**
     * Restarts the process if it's not currently being killed. If the process is running or connected,
     * it will attempt to kill it before restarting.
     *
     * @async
     */
    restart(): Promise<void>;
    /**
     * Checks the health of the process. This method logs the current status of the process,
     * and restarts it if it is found to be hanging (not running).
     *
     */
    checkHealth(): void;
    /**
     * Handle the process termination and subsequent restart.
     * It sequentially sends SIGINT, SIGTERM, and SIGKILL signals to the process with a pause
     * between each signal to allow for graceful termination.
     *
     * @async
     * @private
     */
    private _killAndRun;
}
/**
 * JobProcess class is responsible for handling the individual processes of a job.
 * Each instance of this class represents a running job process, encapsulating details such as
 * the process ID, its worker, runtime options, and state indicators (like whether it's running or being terminated).
 *
 * This class extends EventEmitter to allow monitoring and reacting to different states of the job process through various events.
 */
export type Worker = import('./worker.mjs').default;
import { EventEmitter } from 'node:events';
import JobProcessChild from './job-process-child.mjs';
//# sourceMappingURL=job-process.d.mts.map