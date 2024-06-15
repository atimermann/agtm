/**
 * Manages the executions of a given job
 *
 * Events:
 * run - Fired whenever a new worker execution starts
 * exit - Fired when process is finished
 */
export default class Worker extends EventEmitter {
    /**
     * Instantiate a new worker
     *
     * @param           name.name
     * @param           name
     * @param           job
     * @param           persistent
     * @param           auto
     * @param           options
     * @param           name.job
     * @param           name.persistent
     * @param           name.auto
     * @param           name.options
     * @return {Worker}
     */
    static create({ name, job, persistent, auto, options }: {
        name: any;
        job: any;
        persistent: any;
        auto: any;
        options?: {};
    }): Worker;
    /**
     * The name of the worker.
     *
     * @type {string}
     */
    name: string;
    /**
     * The job associated with the worker.
     *
     * @type {Job}
     */
    job: Job;
    /**
     * Whether the worker is persistent.
     *
     * @type {boolean}
     */
    persistent: boolean;
    /**
     * If the worker was created automatically by the manager
     *
     * @type {boolean}
     */
    auto: boolean;
    /**
     * The options for the worker.
     *
     * @type {{}}
     */
    options: {};
    /**
     * List of processes that are running the job
     *
     *  @type {JobProcess[]}
     */
    jobProcesses: JobProcess[];
    /**
     * Unique identification of the execution based on the date
     *
     * @type {string}
     */
    runId: string;
    /**
     * Worker execution start time
     *
     * @type {Date}
     */
    startAt: Date;
    /**
     * Run processes from this worker
     *
     * @return {Promise<void>}
     */
    run(): Promise<void>;
    /**
     * Restart jobs for a specific worker.
     */
    restartProcesses(): Promise<void>;
    /**
     * Checks the health of processes (if they are running)
     */
    checkHealth(): void;
}
/**
 * **Created on 07/06/2023**
 *
 * library/jobs/worker.mjs
 */
export type JobProcess = import('./job-process.mjs').default;
/**
 * **Created on 07/06/2023**
 *
 * library/jobs/worker.mjs
 */
export type Job = import('./job.mjs').default;
import { EventEmitter } from 'node:events';
import JobProcess from './job-process.mjs';
//# sourceMappingURL=worker.d.mts.map