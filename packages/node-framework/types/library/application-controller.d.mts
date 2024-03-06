/**
 *
 */
export default class ApplicationController {
    /**
     * A mapping of controller types to their respective classes. Each key is a string
     * representing the controller type, and the value is the corresponding controller class.
     *
     * @type {{[key: string]: typeof BaseController}}
     */
    static controllerMap: {
        [key: string]: typeof BaseController;
    };
    /**
     * Returns the available controller types.
     *
     * @return {Array<string>} List of available controller types
     */
    static get controllerTypes(): string[];
    /**
     * Checks if a given controller is an instance of the specified controller type.
     * This method ensures that the controller matches the expected type as defined in the controllerMap.
     *
     * @param {BaseController} controller  - The controller instance to be checked.
     * @param {string}         type        - The string identifier of the controller type to compare against.
     * @throws {TypeError} - Throws a TypeError if the controller is not an instance of the specified type, indicating a mismatch.
     */
    static instanceOf(controller: BaseController, type: string): void;
    /**
     * Returns all controllers of the current application and sets attributes about the current application.
     *
     * @param  {Array<Application>}             applications       - Array of application objects to process
     * @param  {string[]}                       [controllersType]  - List of controller types to load
     *
     * @return {Promise<Array<BaseController>>}                    A promise that resolves to an array of controller instances
     */
    static getControllersInstances(applications: Array<Application>, controllersType?: string[]): Promise<Array<BaseController>>;
    /**
     * Returns all controllers of the specified app.
     *
     * @param  {string}                         appsPath           Physical path of the directory where the apps of this application are located
     * @param  {string[]}                       [controllersType]  - List of controller types to load
     *
     * @return {Promise<Array<BaseController>>}                    List of already instantiated controllers
     */
    static "__#9@#getControllersInstanceByApps"(appsPath: string, controllersType?: string[]): Promise<Array<BaseController>>;
    /**
     * Loads and returns all controllers defined in the 'Controllers' directory.
     *
     * @param  {string}                         controllersPath  Directory where the controllers are located
     *
     * @return {Promise<Array<BaseController>>}                  List of already instantiated controllers
     */
    static "__#9@#getControllersInstanceByControllers"(controllersPath: string): Promise<Array<BaseController>>;
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
import BaseController from './controller/base-controller.mjs';
//# sourceMappingURL=application-controller.d.mts.map