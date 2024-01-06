/**
 * Provides job-related functionality for extending classes.
 *
 * This mixin encapsulates logic related to job management and execution. Classes
 * that need job-related capabilities can extend this mixin to inherit its methods
 * and properties.
 *
 * @mixin
 *
 * @requires {string} Controller#appName          - Expected to be defined in the base class.
 * @requires {string} Controller#applicationName  - Expected to be defined in the base class.
 * @requires {string} Controller#controllerName   - Expected to be defined in the base class. *
 */
export default class JobsMixin {
    /**
     * Create a new job.
     *
     * @param {string}      name         - The name of the job.
     * @param {string|null} schedule     - The schedule for the job in cron format, or null if the job is not scheduled.
     * @param {Function}    jobFunction  - The function that will be executed when the job is processed.
     * @param {object}      [options]    - Optional settings for the job.
     * @throws {Error} If a job with the provided name already exists.
     */
    createJob(name: string, schedule: string | null, jobFunction: Function, options?: object): void;
    /**
     * Creates workers to process a given job
     *
     * @param {string} name     Nome do Grupo de workes
     * @param {string} jobName  Nome da tarefa que será processda
     * @param          options  Configuração dos workers
     */
    createWorkers(name: string, jobName: string, options: any): void;
    /**
     * Sends data to the parent process, used as communication between the running job and the application
     *
     * @param {string} messageName
     * @param {object} message
     */
    sendMessage(messageName: string, message: object): void;
    /**
     * @callback          onProcessDataCallback
     * @param    {any}    data                   - Data sent by the job.
     * @param    {Worker} worker                 - Worker instance that is managing the job.
     * @param    {object} jobProcess             - Information about the job process.
     * @param    {object} childProcess           - The child process object.
     */
    /**
     * Subscribes to a specified message from a child process, which is triggered via the `sendMessage` method.
     *
     * This is an alias for `WorkerManager.events.on('processMessage', async (worker, jobProcess, childProcess, messageName, message) => {...})`.
     *
     * @param {string}                messageName  - The name of the message to listen for. This is used to filter incoming messages.
     * @param {onProcessDataCallback} fn           - The callback function that will be invoked when the specified message is received.
     *
     * @example
     * onMessage('myMessage', (data, worker, jobProcess, childProcess) => {
     *  // Do something with the received data
     * });
     */
    onMessage(messageName: string, fn: (data: any, worker: Worker, jobProcess: object, childProcess: object) => any): void;
    /**
     * Defines a function that will be executed in all jobs in this controller when initializing the job
     *
     * @param {Function} jobSetupFunction  Function to be performed
     * @param {boolean}  allApplications   Runs on all jobs in all applications
     * @param {boolean}  allApps           Run all games from all apps in this application
     * @param {boolean}  allControllers    Executes all jobs on all controllers in this app
     */
    jobSetup(jobSetupFunction: Function, allApplications?: boolean, allApps?: boolean, allControllers?: boolean): void;
    /**
     * Defines a function that will be executed in all jobs after the job is finished
     * For persistent jobs, only when an error occurs
     *
     * @param {Function} jobTeardownFunction  Function to be performed
     * @param {boolean}  allApplications      Runs on all jobs in all applications
     * @param {boolean}  allApps              Run all games from all apps in this application
     * @param {boolean}  allControllers       Executes all jobs on all controllers in this app
     */
    jobTeardown(jobTeardownFunction: Function, allApplications?: boolean, allApps?: boolean, allControllers?: boolean): void;
    /**
     * Ends the execution of the job, it must always be called to perform finishing tasks.
     *
     * @param  {number}        exitCode
     * @return {Promise<void>}
     */
    exit(exitCode?: number): Promise<void>;
    /**
     * Loading jobs
     *
     * Optional abstract method, used for defining jobs.
     * Can be overridden in a subclass if custom job definitions are needed.
     */
    jobs(): Promise<void>;
}
import Worker from '../jobs/worker.mjs';
//# sourceMappingURL=jobs-mixin.d.mts.map