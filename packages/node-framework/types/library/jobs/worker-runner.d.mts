/**
 *
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
     * This method is execution of a worker in a separate process.
     * It loads all jobs and executes the specific job that matches the command-line arguments.
     *
     * @param  {import('../application.mjs').Application} application  - The application context.
     *
     * @throws Will throw an error if the specific job could not be found.
     *
     * @return {Promise<void>}
     *
     * @static
     */
    static run(application: any): Promise<void>;
    /**
     *
     * @param exitCode
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
    static _createProcessListeners(job: Job): void;
    /**
     * Finish process
     *
     * @param  {Job}           job       - The Job in execution
     * @param                  exitCode
     * @return {Promise<void>}
     * @private
     */
    private static _exitProcess;
}
/**
 * **Created on 07/06/2023**
 *
 * library/worker-manager.mjs
 */
export type Job = import('./job.mjs').default;
//# sourceMappingURL=worker-runner.d.mts.map