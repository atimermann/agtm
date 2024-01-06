/**
 *
 */
export default class JobManager {
    /**
     * A static object property holding a collection of all jobs managed by the system.
     * The jobs are stored in key-value pairs, where each key is a unique hash generated
     * for the job and the value is the job's details.
     *
     * @typedef {Object.<string, Job>} staticJobs
     */
    static jobs: {};
    static jobSetupAndTeadDownFunctions: any[];
    static events: EventEmitter;
    /**
     * Load Manager
     * (Loads jobs and workers)
     *
     * @param                  application
     * @return {Promise<void>}
     */
    static load(application: any): Promise<void>;
    /**
     * Initializes the Job Manager. This involves setting up the worker environment
     * and starting the job schedules.
     *
     * @param  {import('../application.mjs').Application} application  - The application context within which the job manager operates.
     *
     * @return {Promise<void>}                                         A promise that resolves when the Job Manager has been initialized.
     * @static
     */
    static run(application: any): Promise<void>;
    /**
     * Defines startup functions for jobs belonging to the specified application, app and controller.
     * If null defines for all jobs.
     *
     * @param jobSetupFunction
     * @param applicationName
     * @param appName
     * @param controllerName
     */
    static setSetupFunction(jobSetupFunction: any, applicationName: any, appName: any, controllerName: any): void;
    /**
     * Defines teardown functions to the specified application, app and controller.
     * If null defines for all jobs.
     *
     * Persistent jobs, will only run in case of error
     *
     * @param jobTeardownFunction
     * @param applicationName
     * @param appName
     * @param controllerName
     */
    static setTeardownFunction(jobTeardownFunction: any, applicationName: any, appName: any, controllerName: any): void;
    /**
     * Add a new job
     *
     * @param {Job} job
     */
    static addJob(job: Job): void;
    /**
     * Checks if job is active
     *
     * @param  {Controller} controller
     * @return                          boolean
     * @private
     */
    private static _isJobEnabled;
    /**
     * Retrieves a Job instance from worker attributes. This involves searching through
     * the static job collection and returning the job that matches the given attributes.
     *
     * @param  {string} applicationName  - The name of the application the job is associated with.
     * @param  {string} appName          - The name of the app under which the job falls.
     * @param  {string} controllerName   - The name of the controller managing the job.
     * @param  {string} name             - The name of the job.
     *
     * @return {Job}                     The job instance that matches the given attributes.
     * @static
     */
    static getJob(applicationName: string, appName: string, controllerName: string, name: string): Job;
    /**
     * Retrieves a Job instance by uuid
     *
     * @param  {string} uuid
     * @return {Job}          The job instance that matches the given attributes.
     */
    static getJobByUUID(uuid: string): Job;
    /**
     * Returns information about jobs for monitoring
     *
     * TODO: Assume apenas um worker por job, se tiver mais de um pega ultimo necessario fazer tratativa
     *
     * @return {{}}
     */
    static getJobsInformation(): {};
    /**
     * Configures setup and teardown functions for all system jobs according to application, app and controller
     *
     * @private
     */
    private static _configureSetupAndTeardownFunctions;
    /**
     * Filter list of setup and teardown functions for specific job
     *
     * @param        job
     * @return {*[]}
     * @private
     */
    private static _filterFunctiontoJob;
    /**
     * Creates workers for all the jobs that have been scheduled. Each job is assigned a worker
     * that will be responsible for executing the job as per its schedule.
     *
     * @static
     * @private
     */
    private static _createScheduledWorkers;
    /**
     * Loads the job and worker details from the user-defined application context.
     * This involves scanning through all the controllers and extracting the job details.
     *
     * @param  {import('../application.mjs').Application} application  - The application context within which to find the jobs.
     *
     * @return {Promise<void>}                                         A promise that resolves when all jobs and workers have been loaded.
     * @static
     * @private
     */
    /**
     *
     * @param application
     */
    static _loadJobsAndWorkersFromController(application: any): Promise<void>;
    /**
     * Starts all the scheduled jobs. This involves initiating the execution of each job
     * as per its predefined schedule.
     *
     * @return {Promise<void>} A promise that resolves when all scheduled jobs have started execution.
     * @static
     * @private
     */
    private static _startScheduleJob;
    /**
     * Schedules a job to run at predefined intervals. This involves creating a cron job
     * that triggers the job execution as per its schedule.
     *
     * @param  {Job}           job  - The job object that needs to be scheduled.
     * @return {Promise<void>}      A promise that resolves when the job has been scheduled.
     * @static
     * @private
     */
    private static _schedulingJob;
}
import { EventEmitter } from 'node:events';
import Job from './job.mjs';
//# sourceMappingURL=job-manager.d.mts.map