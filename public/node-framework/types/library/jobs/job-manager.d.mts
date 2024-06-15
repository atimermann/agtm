/**
 * Manages and schedules jobs for execution.
 */
export default class JobManager {
    /**
     * A static object property holding a collection of all jobs managed by the system.
     * The jobs are stored in key-value pairs, where each key is a unique hash generated
     * for the job and the value is the job's details.
     *
     * @type {JobDict} Holds all managed jobs, keyed by their unique UUID.
     */
    static jobs: JobDict;
    /**
     * Used for setting up or tearing down jobs. Each object in the array specifies a function to be
     * executed during the setup or teardown phase of a job, along with the scope (application, app,
     * and controller names) to which the function applies. This allows the system to know which functions
     * to execute for each job based on its scope.
     *
     * @type {JobSetupAndTeardownFunction[]} A list of functions and their associated scope information
     */
    static jobSetupAndTeadDownFunctions: JobSetupAndTeardownFunction[];
    static events: EventEmitter;
    /**
     * Loads and initializes jobs and workers from the provided application context.
     *
     * @param  {Application}   application  - The application context to load jobs from.
     * @return {Promise<void>}              Resolves when all jobs and workers are loaded.
     */
    static load(application: Application): Promise<void>;
    /**
     * Initializes the Job Manager. This involves setting up the worker environment
     * and starting the job schedules.
     *
     * @param  {Application}   application  - The application context within which the job manager operates.
     *
     * @return {Promise<void>}              A promise that resolves when the Job Manager has been initialized.
     */
    static run(application: Application): Promise<void>;
    /**
     * Registers a function to run during job setup for specified application components.
     *
     * @param {Function} jobSetupFunction  - The function to run during job setup.
     * @param {string}   applicationName   - The name of the application to scope the setup function to.
     * @param {string}   appName           - The name of the app to scope the setup function to.
     * @param {string}   controllerName    - The name of the controller to scope the setup function to.
     */
    static setSetupFunction(jobSetupFunction: Function, applicationName: string, appName: string, controllerName: string): void;
    /**
     * Registers a function to run during job teardown for specified application components.
     *
     * @param {Function} jobTeardownFunction  - The function to run during job teardown.
     * @param {string}   applicationName      - The name of the application to scope the teardown function to.
     * @param {string}   appName              - The name of the app to scope the teardown function to.
     * @param {string}   controllerName       - The name of the controller to scope the teardown function to.
     */
    static setTeardownFunction(jobTeardownFunction: Function, applicationName: string, appName: string, controllerName: string): void;
    /**
     * Adds a new job to the manager.
     *
     * @param {Job} job  - The job to add.
     */
    static addJob(job: Job): void;
    /**
     * Checks if a job is active based on application, app, and controller settings.
     *
     * @param  {JobsController} controller  - The controller the job belongs to.
     * @return {boolean}                    True if the job is enabled; false otherwise.
     */
    static "__#7@#isJobEnabled"(controller: JobsController): boolean;
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
     */
    static getJob(applicationName: string, appName: string, controllerName: string, name: string): Job;
    /**
     * Wraps a string in double quotes if it contains spaces or special characters,
     * escaping any internal double quotes. Useful for shell command preparation.
     *
     * @param  {string} str  - String to potentially quote.
     * @return {string}      - Quoted string with escaped double quotes, or original string if no quoting needed.
     */
    static "__#7@#quoteIfNeeded"(str: string): string;
    /**
     * Retrieves a Job instance by its UUID.
     *
     * This method looks up a job in the stored jobs collection using the provided UUID. If a job with the given
     * UUID exists, it returns the corresponding Job instance. This is useful for operations where you have a job's
     * UUID and need to retrieve its full details or interact with the job object.
     *
     * @param  {string} uuid  - The UUID of the job to retrieve.
     * @return {Job}          The Job instance that corresponds to the provided UUID, or undefined if no such job exists.
     */
    static getJobByUUID(uuid: string): Job;
    /**
     * Returns information about all managed jobs for monitoring purposes. This method collects
     * data about each job and its associated workers, including their states and configurations.
     * It's particularly useful for understanding the system's current operational status and for
     * debugging or monitoring purposes.
     *
     * Note: Currently, this method assumes there's only one worker per job. If there are multiple
     * workers for a job, it will only consider the last one. Further development is needed to
     * handle multiple workers per job adequately.
     *
     * TODO: Handle multiple workers per job appropriately.
     *
     * @return {JobDict} An object containing detailed information about each job. The keys
     *                   are the job UUIDs, and the values are objects containing job details and worker information.
     */
    static getJobsInformation(): JobDict;
    /**
     * Configures setup and teardown functions for all system jobs according to application, app and controller.
     *
     */
    static "__#7@#configureSetupAndTeardownFunctions"(): void;
    /**
     * Filters the list of setup and teardown functions to find those that are applicable to a specific job.
     * It checks the job's application name, app name, and controller name against each setup and teardown
     * function's intended scope. Only functions that match or have no specified scope for these parameters
     * are considered applicable and returned.
     *
     * This method is used internally to associate the correct setup and teardown functions with each job
     * based on its scope. It's essential for ensuring that jobs are initialized and cleaned up correctly
     * according to their specific requirements and the system's configuration.
     *
     * @param  {Job}                                job  - The job to filter setup and teardown functions for.
     * @return {Array<JobSetupAndTeardownFunction>}      An array of setup and teardown functions applicable to the given job.
     */
    static "__#7@#filterFunctiontoJob"(job: Job): Array<JobSetupAndTeardownFunction>;
    /**
     * Creates workers for all the jobs that have been scheduled. Each job is assigned a worker
     * that will be responsible for executing the job as per its schedule.
     *
     *
     */
    static "__#7@#createScheduledWorkers"(): void;
    /**
     * Loads the job and worker details from the user-defined application context.
     * This involves scanning through all the controllers and extracting the job details.
     *
     * @param  {Application}   application  - The application context within which to find the jobs.
     *
     * @return {Promise<void>}              A promise that resolves when all jobs and workers have been loaded.
     */
    static "__#7@#loadJobsAndWorkersFromController"(application: Application): Promise<void>;
    /**
     * Starts all the scheduled jobs. This involves initiating the execution of each job
     * as per its predefined schedule.
     *
     * @return {Promise<void>} A promise that resolves when all scheduled jobs have started execution.
     */
    static "__#7@#startScheduleJob"(): Promise<void>;
    /**
     * Schedules a job to run at predefined intervals. This involves creating a cron job
     * that triggers the job execution as per its schedule.
     *
     * @param  {Job}           job  - The job object that needs to be scheduled.
     * @return {Promise<void>}      A promise that resolves when the job has been scheduled.
     */
    static "__#7@#schedulingJob"(job: Job): Promise<void>;
}
/**
 * **Created on 07/06/2023**
 */
export type Application = import('../application.mjs').default;
/**
 * **Created on 07/06/2023**
 */
export type JobsController = import('./../controller/jobs.mjs').default;
/**
 * **Created on 07/06/2023**
 */
export type JobDict = {
    [key: string]: Job;
};
/**
 * A specialized function type for job setup or teardown functions. These functions are scoped to
 * specific application components and have a type indicating whether they are for setup or teardown.
 */
export type JobFunction = Function;
/**
 * Represents a setup or teardown function along with its scope.
 * This type is used for objects that define a function to run during job setup or teardown,
 * and includes the scope (application, app, and controller names) to which the function applies.
 */
export type JobSetupAndTeardownFunction = {
    /**
     * - The function to run during job setup or teardown.
     */
    jobSetupFunction?: JobFunction;
    /**
     * - The function to run during job teardown.
     */
    jobTeardownFunction?: JobFunction;
    /**
     * - The name of the application to scope the setup or teardown function to.
     */
    applicationName: string;
    /**
     * - The name of the app to scope the setup or teardown function to.
     */
    appName: string;
    /**
     * - The name of the controller to scope the setup or teardown function to.
     */
    controllerName: string;
    /**
     * - The type of function, either setup or teardown, indicated by a constant like SETUP_FUNCTION or TEARDOWN_FUNCTION.
     */
    type: number;
};
import { EventEmitter } from 'node:events';
import Job from './job.mjs';
//# sourceMappingURL=job-manager.d.mts.map