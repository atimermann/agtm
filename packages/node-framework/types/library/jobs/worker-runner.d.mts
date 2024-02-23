/**
 * Class responsible for managing the execution of jobs in a separate process. It orchestrates
 * the job lifecycle, including setup, execution, and teardown.
 */
export default class WorkerRunner {
    /**
     * Job running
     *
     * @type {Job}
     * @static
     */
    static job: Job;
    /**
     * Pid of parent process
     *
     * @type {*}
     */
    static parentPid: any;
    /**
     * Enables parent process monitoring, if the parent dies, this job is terminated
     * Prevents many processes from being started without control by locking the machine in case of a problem
     *
     * @type {boolean}
     */
    static checkParent: boolean;
    /**
     * This method is execution of a worker in a separate process.
     * It loads all jobs and executes the specific job that matches the command-line arguments.
     *
     * @param  {Application}   application  - The application context.
     * @param  {boolean}       checkParent  - Monitor connection to parent process, terminates if connection is lost
     *
     * @throws Will throw an error if the specific job could not be found.
     *
     * @return {Promise<void>}
     *
     * @static
     */
    static run(application: Application, checkParent: boolean): Promise<void>;
    /**
     * End process by executing tearDown functions.
     *
     * @param {number} exitCode  Exit code
     */
    static exitProcess(exitCode?: number): Promise<void>;
    /**
     * Sets up a listener for the SIGINT event, which is triggered when the user presses Ctrl+C.
     * The application then calls the 'jobTeardown' method of the controller and finally terminates itself.
     * SIGKILL and SIGTERM should be handled by the application.
     *
     * @param  {Job}  job  - The Job in execution
     *
     * @return {void}
     *
     * @static
     */
    static "__#7@#createProcessListeners"(job: Job): void;
    /**
     * Start monitoring parent process.
     */
    static "__#7@#checkParent"(): void;
    /**
     * Terminates the job execution process.
     * This method executes the teardown functions of the job and then exits the process with a specified exit code.
     *
     * @param  {Job}           job         - The job currently in execution.
     * @param  {number}        [exitCode]  - The exit code used to terminate the process. Defaults to 0.
     * @return {Promise<void>}
     */
    static "__#7@#exitProcess"(job: Job, exitCode?: number): Promise<void>;
}
/**
 * **Created on 07/06/2023**
 */
export type Job = import('./job.mjs').default;
/**
 * **Created on 07/06/2023**
 */
export type Application = import('../application.mjs').default;
//# sourceMappingURL=worker-runner.d.mts.map