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
     * A dictionary of workers, indexed by their names.
     * It allows quick access to worker instances based on a unique string identifier.
     *
     * @type {WorkerDict}
     */
    static indexedWorkers: WorkerDict;
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
     * Starts Worker Manager.
     *
     * @return {Promise<void>}
     */
    static init(): Promise<void>;
    /**
     * Adds a new Worker to the Worker Manager.
     *
     * @param {Worker} worker  - The Worker instance to add.
     *
     * @throws {Error} If a Worker with the same name already exists.
     */
    static addWorker(worker: Worker): void;
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
     * Returns worker information for monitoring.
     *
     * @return {WorkerDict} An object containing workers indexed by their names.
     */
    static getWorkersInformation(): WorkerDict;
}
/**
 * Created on 04/07/2023
 */
export type Worker = import('./worker.mjs').default;
/**
 * TODO: Criar controle de processos zumbis
 * TODO: Parametrizar delay
 * TODO: Parametrizar options for workers
 */
export type WorkerDict = {
    [key: string]: Worker;
};
import Worker from './worker.mjs';
//# sourceMappingURL=worker-manager.d.mts.map