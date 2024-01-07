/**
 *
 */
export default class ApplicationController {
    /**
     * Returns all controllers of the current application and sets attributes about the current application.
     *
     * @param  {Array<Application>}         applications  - Array of application objects to process
     * @return {Promise<Array<Controller>>}               A promise that resolves to an array of controller instances
     */
    static getControllersInstances(applications: Array<Application>): Promise<Array<Controller>>;
    /**
     * Returns all controllers of the specified app.
     *
     * @param  {string}                     appsPath  Physical path of the directory where the apps of this application are located
     *
     * @return {Promise<Array<Controller>>}           List of already instantiated controllers
     * @private
     */
    private static _getControllersInstanceByApps;
    /**
     * Loads and returns all controllers defined in the 'Controllers' directory.
     *
     * @param  {string}                     controllersPath  Directory where the controllers are located
     *
     * @return {Promise<Array<Controller>>}                  List of already instantiated controllers
     * @private
     */
    private static _getControllersInstanceByControllers;
    /**
     * Checks if the directory for the given application exists.
     *
     * @param {Application} application  - Array of application objects to process
     * @throws {Error} Throws an error if the directory specified in the application's 'appsPath' does not exist.
     */
    static checkAppsDirectoryExist(application: Application): Promise<void>;
    /**
     * Checks if the specified directory exists.
     *
     * @param  {string}           directoryPath  - The path of the directory to check.
     * @return {Promise<boolean>}                Returns true if the directory exists, false otherwise.
     */
    static exists(directoryPath: string): Promise<boolean>;
}
/**
 * **Created on 16/11/18**
 */
export type Application = import('./application.mjs').default;
import Controller from './controller/controller.mjs';
//# sourceMappingURL=application-controller.d.mts.map