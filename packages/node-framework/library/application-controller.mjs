/**
 * **Created on 16/11/18**
 *
 * @author André Timermann <andre@timermann.com.br>
 *
 * @file ApplicationController.mjs
 * Central controller logic for managing application's controllers.
 * Provides functionality to get instances of all controllers,
 * check the existence of directories, and handle the loading and instantiation of controller modules.
 *
 * @typedef {import('./application.mjs').default} Application
 */

import path from 'node:path'
import { readdir, access } from 'node:fs/promises'

import BaseController from './controller/base-controller.mjs'
import SocketController from './controller/socket.mjs'
import CoreController from './controller/core.mjs'
import JobsController from './controller/jobs.mjs'
import HttpController from './controller/http.mjs'

import createLogger from './logger.mjs'
const logger = createLogger('ApplicationController')

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
  static controllerMap = {
    socket: SocketController,
    core: CoreController,
    jobs: JobsController,
    http: HttpController
  }

  /**
   * Returns the available controller types.
   *
   * @return {Array<string>} List of available controller types
   */
  static get controllerTypes () {
    return Object.keys(this.controllerMap)
  }

  /**
   * Checks if a given controller is an instance of the specified controller type.
   * This method ensures that the controller matches the expected type as defined in the controllerMap.
   *
   * @param {BaseController} controller  - The controller instance to be checked.
   * @param {string}         type        - The string identifier of the controller type to compare against.
   * @throws {TypeError} - Throws a TypeError if the controller is not an instance of the specified type, indicating a mismatch.
   */
  static instanceOf (controller, type) {
    const controllerName = controller.controllerName

    if (!(controller instanceof this.controllerMap[type])) {
      throw new TypeError(`Controller "${controllerName}" must to be an instance of "${this.controllerMap[type].name}"`)
    }
  }

  /**
   * Returns all controllers of the current application and sets attributes about the current application.
   *
   * @param  {Array<Application>}             applications       - Array of application objects to process
   * @param  {string[]}                       [controllersType]  - List of controller types to load
   *
   * @return {Promise<Array<BaseController>>}                    A promise that resolves to an array of controller instances
   */
  static async getControllersInstances (applications, controllersType) {
    const controllersInstances = []

    for (const application of applications) {
      logger.debug(`Entering application '${application.name}'`)

      await this.checkAppsDirectoryExist(application)

      for (const controllerInstance of await this.#getControllersInstanceByApps(application.appsPath, controllersType)) {
        // Defines application attributes to the controller
        controllerInstance.applicationName = application.name
        controllerInstance.applicationPath = application.path
        controllerInstance.applicationId = application.uuid

        controllersInstances.push(controllerInstance)
      }
    }

    return controllersInstances
  }

  /**
   * Returns all controllers of the specified app.
   *
   * @param  {string}                         appsPath           Physical path of the directory where the apps of this application are located
   * @param  {string[]}                       [controllersType]  - List of controller types to load
   *
   * @return {Promise<Array<BaseController>>}                    List of already instantiated controllers
   */
  static async #getControllersInstanceByApps (appsPath, controllersType) {
    const controllersInstances = []

    for (const appName of await readdir(appsPath)) {
      logger.debug(`Entering App '${appName}'`)

      const appPath = path.join(appsPath, appName)

      for (const controllerDirectory of Object.keys(this.controllerMap)) {
        if (!controllersType || controllersType.includes(controllerDirectory)) {
          const controllersPath = path.join(appsPath, appName, controllerDirectory)
          if (await this.exists(controllersPath)) {
            for (const controllerInstance of await this.#getControllersInstanceByControllers(controllersPath)) {
              // Defines app attributes to the Controller
              controllerInstance.appName = appName
              controllerInstance.appPath = appPath
              controllerInstance.controllerType = controllerDirectory

              controllersInstances.push(controllerInstance)
            }
          }
        }
      }
    }

    return controllersInstances
  }

  /**
   * Loads and returns all controllers defined in the 'Controllers' directory.
   *
   * @param  {string}                         controllersPath  Directory where the controllers are located
   *
   * @return {Promise<Array<BaseController>>}                  List of already instantiated controllers
   */
  static async #getControllersInstanceByControllers (controllersPath) {
    const controllersInstances = []

    for (const controllerName of await readdir(controllersPath)) {
      const controllerPath = path.join(controllersPath, controllerName)
      let TargetController

      if (['.mjs', '.js'].includes(path.extname(controllerPath))) {
        logger.debug(`Loading controller '${path.basename(controllerName)}'`)

        TargetController = (await import(controllerPath)).default
        const controllerInstance = new TargetController()

        if (!(controllerInstance instanceof BaseController)) {
          throw new TypeError('Controller must be an instance of Controller. If you are importing a sub-application ' +
              'of a module, make sure that both are using the same version of the node-framework, you must use the same ' +
              `instance, import from the same file. Use ApplicationLoader! Controller incompatible in "${controllerPath}"!`)
        }

        controllerInstance.controllerName = path.basename(controllerName, path.extname(controllerPath))
        controllersInstances.push(controllerInstance)
      }
    }

    return controllersInstances
  }

  /**
   * Checks if the directory for the given application exists.
   *
   * @param {Application} application  - Array of application objects to process
   * @throws {Error} Throws an error if the directory specified in the application's 'appsPath' does not exist.
   */
  static async checkAppsDirectoryExist (application) {
    try {
      await access(application.appsPath)
    } catch (err) {
      throw new Error(`Directory "${application.appsPath}" does not exist in application "${application.name}"`)
    }
  }

  /**
   * Checks if the specified directory exists.
   *
   * @param  {string}           directoryPath  - The path of the directory to check.
   * @return {Promise<boolean>}                Returns true if the directory exists, false otherwise.
   */
  static async exists (directoryPath) {
    try {
      await access(directoryPath)
      return true
    } catch (err) {
      return false
    }
  }
}
