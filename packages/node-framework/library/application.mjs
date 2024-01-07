/**
 * Created at 20/09/2018
 *
 * src/library/application.js
 *
 * @author André Timermann
 *
 * @file
 * This class represents an application in the framework.
 * A new instance of it will always be created in a new project.
 * An Application can load other applications or be loaded by other applications,
 * enabling reusability.
 *
 * @typedef {import('./controller/base-controller.mjs').default} BaseController
 * @typedef {import('./controller/jobs.mjs').default} JobsController - The controller for handling job-related actions.
 * @typedef {import('./controller/socket.mjs').default} SocketController - The controller for handling socket-related actions.
 * @typedef {import('./controller/core.mjs').default} CoreController - The main controller handling core framework functionalities.
 * @typedef {import('./controller/http.mjs').default} HttpController - The controller for handling HTTP-related actions.
 *
 * @typedef {object} Libraries
 * @property {Function}             createLogger     - Function to create a logger instance.
 * @property {typeof JobManager}    JobManager       - The JobManager class.
 * @property {typeof WorkerManager} WorkerManager    - The WorkerManager class.
 * @property {typeof Config}        Config           - The Config class.
 *
 * @typedef {object} AppInfo
 * @property {string}               path             - Caminho para o app.
 * @property {string}               applicationName  - Nome da aplicação à qual o app pertence.
 * @property {string}               appName          - Nome do app.
 */

import assert from 'node:assert'
import ApplicationController from './application-controller.mjs'
import path from 'node:path'
import { readdir } from 'node:fs/promises'
import createLogger from './logger.mjs'
// import { readFileSync } from 'node:fs' TODO: usado por _nodeFrameworkVersion, remover depois de garantir q não será usado
import WorkerManager from './jobs/worker-manager.mjs'
import JobManager from './jobs/job-manager.mjs'
import Config from './config.mjs'

// const filePath = new URL('../package.json', import.meta.url) TODO: usado por _nodeFrameworkVersion, remover depois de garantir q não será usado
// const packageInfo = JSON.parse(readFileSync(filePath, 'utf8')) TODO: usado por _nodeFrameworkVersion, remover depois de garantir q não será usado

const logger = createLogger('Application')

/**
 *
 */
export default class Application {
  // /**
  //  * Package version for Validate instance
  //  *
  //  * @type {string}
  //  * @private
  //  */
  // static _nodeFrameworkVersion = packageInfo.version TODO: usado por _nodeFrameworkVersion, remover depois de garantir q não será usado

  /**
   * Stores a list of loaded applications , include self
   *
   * @type {Array<Application>}
   */
  applications = []

  /**
   * Lista de instancia de controllers
   *
   * @type {Array<BaseController>}
   */
  controllers = []

  /**
   * A unique identifier for the application
   */
  uuid = Date.now() + '-' + Math.random().toString(36).substr(2, 9)

  /**
   * indicates that application has already been initialized
   *
   * @type {boolean}
   */
  initialized = false

  /**
   * Returns list of applications to be used in importable apps.
   *
   * @return {Libraries} Object containing references to various library classes.
   */
  static getLibraries () {
    return {
      createLogger,
      JobManager,
      WorkerManager,
      Config
    }
  }

  /**
   * The constructor of the Application class.
   *
   * @param {string} applicationPath  - The physical path of the application. This should be defined using __dirname.
   * @param {string} name             - The name of the application that will be loaded. This is mandatory.
   * @throws {Error} Will throw an error if the path or name parameters are not provided or not of type 'string'.
   */
  constructor (applicationPath, name) {
    logger.info(`Instantiating application "${name}"...`)

    assert(name, 'Attribute "name" is required!')
    assert(name, 'Attribute "path" is required!')

    if (typeof name !== 'string') throw new TypeError('Attribute "name" must be string! ' + name)
    if (typeof applicationPath !== 'string') throw new TypeError('Attribute "path" must be string! ' + applicationPath)

    /**
     * The name of the Application
     *
     * @type {string}
     */
    this.name = name

    /**
     * The path of this Application
     *
     * @type {string}
     */
    this.path = applicationPath

    /**
     * The path of apps in this application
     */
    this.appsPath = path.join(applicationPath, 'apps')

    // Adds itself to the list of applications
    this.applications.push(this)
  }

  /**
   * Loads a sub-application (a dependency of the main application).
   *
   * @param {(ApplicationClass: typeof Application) => Application} applicationLoader  - A function that receives the Application class and returns an instance of it.
   * @throws {TypeError} Will throw an error if the provided applicationLoader is not a valid function.
   */
  loadApplication (applicationLoader) {
    const application = applicationLoader(Application)

    // TODO: remover depois de garantir q não será usado
    // // @ts-ignore - Used to emphasize that application is an instance of Application
    // if (!application.constructor._nodeFrameworkVersion) {
    //   throw new TypeError('Application must be an instance of Application')
    // }

    if (!(application instanceof Application)) {
      throw new TypeError('Application must be an instance of Application. If you are importing a sub-application ' +
        'of a module, make sure that both are using the same version of the node-framework, you must use the same ' +
        'instance, import from the same file. Use ApplicationLoader!')
    }

    if (this.initialized) {
      throw Error('It is no longer possible to add subapplications, the application has already been initialized.')
    }

    logger.info(`Loading subapplication '${application.name}'. Path: '${application.path}'`)

    for (const definedApplication of application.applications) {
      this.applications.push(definedApplication)
    }
  }

  /**
   * Initializes application, no longer allows loading subapplication.
   */
  async init () {
    logger.info(`Initializing application "${this.name}"...`)
    this.controllers = await ApplicationController.getControllersInstances(this.applications)

    if (this.controllers.length === 0) {
      throw new Error('No controller loaded')
    }
    this.initialized = true
  }

  /**
   * @overload
   * @param  {'jobs'}                type  - Controller type specified as 'jobs'.
   * @return {Array<JobsController>}       The loaded controllers of type 'jobs'.
   */
  /**
   * @overload
   * @param  {'socket'}                type  - Controller type specified as 'socket'.
   * @return {Array<SocketController>}       The loaded controllers of type 'socket'.
   */
  /**
   * @overload
   * @param  {'core'}                type  - Controller type specified as 'core'.
   * @return {Array<CoreController>}       The loaded controllers of type 'core'.
   */
  /**
   * @overload
   * @param  {'http'}                type  - Controller type specified as 'http'.
   * @return {Array<HttpController>}       The loaded controllers of type 'http'.
   */
  /**
   * Returns the loaded controllers of the specified type.
   *
   * @param  {string}                type  - Controller type.
   * @return {Array<BaseController>}       The loaded controllers of unspecified type.
   */
  getControllers (type) {
    return this.controllers
      .filter(controller => controller.controllerType === type)
      .map(controller => {
        ApplicationController.instanceOf(controller, type)

        return controller
      })
  }

  /**
   * Returns information about all apps from all loaded applications.
   *
   * @return {Promise<Array<AppInfo>>} Promise resolved with an array of app information.
   */
  async getApps () {
    /**
     * @type {Array<AppInfo>}
     */
    const apps = []

    for (const application of this.applications) {
      const appsPath = path.join(application.path, 'apps')

      await ApplicationController.checkAppsDirectoryExist(application)

      for (const appName of await readdir(appsPath)) {
        apps.push({
          path: path.join(appsPath, appName),
          applicationName: application.name,
          appName
        })
      }
    }

    return apps
  }
}
