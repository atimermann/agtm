/**
 * Represents a Job object in the system. This object holds the necessary details
 * to manage and execute specific tasks or processes within the application.
 *
 * @augments EventEmitter
 */
export default class Job extends EventEmitter {
    /**
     *
     * @param      applicationName
     * @param      appName
     * @param      controllerName
     * @param      name
     * @param      schedule
     * @param      jobFunction
     * @param      options
     * @return {*}
     */
    /**
     *
     * @param root0
     * @param root0.applicationName
     * @param root0.appName
     * @param root0.controllerName
     * @param root0.name
     * @param root0.schedule
     * @param root0.jobFunction
     * @param root0.options
     */
    static create({ applicationName, appName, controllerName, name, schedule, jobFunction, options }: {
        applicationName: any;
        appName: any;
        controllerName: any;
        name: any;
        schedule: any;
        jobFunction: any;
        options?: {};
    }): Job;
    /**
     * Generates a unique UUID for the job based on its properties.
     *
     * CAUTION: If you change this method, many applications that depend on this uuid will break.
     *
     * @param  {string} applicationName
     * @param  {string} appName
     * @param  {string} controllerName
     * @param  {string} name
     *
     * @return {string}
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
     * Sets UUID for the job
     *
     * @return {string} The generated UUID.
     */
    setUUID(): string;
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
 * **Created on 07/06/2023**
 *
 * library/jobs/job.mjs
 */
export type Worker = import('./worker.mjs').default;
import { EventEmitter } from 'node:events';
//# sourceMappingURL=job.d.mts.map