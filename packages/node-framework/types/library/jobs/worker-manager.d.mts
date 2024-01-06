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
    static workers: Worker[];
    /**
     * Workers dictionary, indexed by name
     *
     * @type {Object.<string, Worker>}
     */
    static indexedWorkers: {
        [x: string]: Worker;
    };
    /**
     * Flag that indicates that workManager is in the verification phase
     * TODO: Validar necessidade
     *
     * @type {boolean}
     */
    static checking: boolean;
    /**
     * EventEmitter
     *
     * @type {module:events.EventEmitter}
     */
    static events: any;
    /**
     * Starts Worker Manager
     *
     * @return {Promise<void>}
     */
    static init(): Promise<void>;
    /**
     * Add a new Worker
     *
     * @param {Worker} worker
     */
    static addWorker(worker: Worker): void;
    /**
     * Creates a new worker.
     *
     * @param  {string}  name        - The name of the worker.
     * @param  {object}  job         - The job associated with the worker.
     * @param  {boolean} persistent  - Whether the worker is persistent.
     * @param  {boolean} auto        - automatically created
     * @param  {object}  options     - The options for the worker.
     *
     * @return {Worker}
     */
    static createWorker(name: string, job: object, persistent: boolean, auto: boolean, options?: object): Worker;
    /**
     * Starts execution of persistent workers.
     *
     * @return {Promise<void>}
     */
    static runPersistentWorkers(): Promise<void>;
    /**
     * Monitors workers health at regular intervals.
     */
    static monitorWorkersHealth(): void;
    /**
     * Checks the health of all workers.
     */
    static verifyWorkersHealth(): void;
    /**
     * returns worker information for monitoring
     *
     * @return {{}}
     */
    static getWorkersInformation(): {};
}
/**
 * TODO: Criar controle de processos zumbis
 * TODO: Parametrizar delay
 * TODO: Parametrizar options for workers
 */
export type Worker = import('./worker.mjs').default;
import Worker from './worker.mjs';
//# sourceMappingURL=worker-manager.d.mts.map