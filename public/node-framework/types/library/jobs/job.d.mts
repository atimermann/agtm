/**
 * Represents a Job object in the system. This object holds the necessary details
 * to manage and execute specific tasks or processes within the application.
 *
 * @augments EventEmitter
 */
export default class Job extends EventEmitter {
    /**
     * Creates a job instance.
     *
     * @static
     * @param  {object}   properties                  - An object containing job creation properties.
     * @param  {string}   properties.applicationName  - The application name.
     * @param  {string}   properties.appName          - The application name.
     * @param  {string}   properties.controllerName   - The controller name.
     * @param  {string}   properties.name             - The job name.
     * @param  {string}   properties.schedule         - The job schedule.
     * @param  {Function} properties.jobFunction      - The job function.
     * @param  {object}   [properties.options]        - Additional options.
     * @return {Job}                                  - The created job instance.
     */
    static create({ applicationName, appName, controllerName, name, schedule, jobFunction, options }: {
        applicationName: string;
        appName: string;
        controllerName: string;
        name: string;
        schedule: string;
        jobFunction: Function;
        options?: object;
    }): Job;
    /**
     * Generates a unique UUID for the job based on its properties. This UUID is created using
     * a SHA-256 hash of a concatenation of the application name, app name, controller name, and
     * job name. The hashed value is then formatted as a standard UUID string. This method ensures
     * that each job has a distinct identifier based on its defining characteristics.
     *
     * CAUTION: If you change this method, many applications that depend on this UUID will break.
     * Changing the algorithm or the input format will result in different UUIDs being generated
     * for the same input parameters, potentially causing issues in systems that rely on the
     * consistency and uniqueness of these IDs.
     *
     * @param  {string} applicationName  - The name of the application to which the job belongs.
     * @param  {string} appName          - The name of the app within the application the job is associated with.
     * @param  {string} controllerName   - The name of the controller managing the job.
     * @param  {string} name             - The unique name identifier for the job.
     *
     * @return {string}                  The generated UUID string in the format "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
     *                                   where each 'x' is a hexadecimal character. This UUID is unique to the combination of the job's
     *                                   application name, app name, controller name, and job name.
     */
    static createUUID(applicationName: string, appName: string, controllerName: string, name: string): string;
    /**
     * The unique identifier for the job, generated using the job's application name,
     * app name, controller name, and job name.
     *
     * @type {string}
     */
    uuid: string;
    /**
     * Name of the application that the job is associated with.
     *
     * @type {string}
     */
    applicationName: string;
    /**
     * Name of the app under which the job falls.
     *
     * @type {string}
     */
    appName: string;
    /**
     * Name of the controller managing the job.
     *
     * @type {string}
     */
    controllerName: string;
    /**
     * Unique name identifier for the job.
     *
     * @type {string}
     */
    name: string;
    /**
     * The schedule for the job in cron format, or null if the job is not scheduled.
     * TODO: Deve ir para o worker
     *
     * @type {string|null}
     */
    schedule: string | null;
    /**
     * Function definition that performs the actual job task.
     *
     * @type {Function}
     */
    jobFunction: Function;
    /**
     * Setup functions to be executed before the main job function.
     *
     * @type {Function[]}
     */
    setupFunctions: Function[];
    /**
     * Teardown functions to be executed after the main job function.
     *
     * @type {Function[]}
     */
    teardownFunctions: Function[];
    /**
     * The worker assigned to execute the job.
     * TODO: Jobs podem ter mais de um worker, remover esta refêrencia
     *
     * @type {Worker}
     */
    worker: Worker;
    /**
     * Optional settings for the job.
     * TODO: Definir Options
     *
     * @type {object}
     */
    options: object;
    /**
     * Generates and assigns a unique UUID to the job instance. The UUID is created using the job's
     * application name, app name, controller name, and job name. It's primarily used to uniquely
     * identify the job within the system.
     *
     * This method should be called during job creation to ensure each job has a distinct identifier.
     * It updates the 'uuid' property of the job instance.
     *
     * @return {void} Sets the 'uuid' property but does not return a value.
     */
    setUUID(): void;
    /**
     * Starts the execution of a job. This involves spawning a child process
     * that executes the job's function.
     *
     * @return {Promise<void>} A promise that resolves when the job starts execution.
     * @static
     */
    run(): Promise<void>;
}
/**
 * - Represents the worker handling the job.
 */
export type Worker = import('./worker.mjs').default;
import { EventEmitter } from 'node:events';
//# sourceMappingURL=job.d.mts.map