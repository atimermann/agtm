/**
 * **Created on 09/20/18**
 *
 * @file src/library/server.js
 * Bootstrap and server execution module.
 * Provides functions to initialize the server and its components.
 *
 * @author André Timermann <andre@timermann.com.br>
 */

import Application from './application.mjs'
import HttpServer from './http-server.mjs'
import HttpServer2 from './http/httpServer2.ts'
import SocketServer from './socket/socket-server.mjs'

import JobManager from './jobs/job-manager.mjs'
import WorkerRunner from './jobs/worker-runner.mjs'

import BlessedInterface from './blessed.mjs'
import Config from './config.mjs'
import os from 'node:os'

import figlet from 'figlet'
import { sentenceCase } from 'change-case'

import createLogger from './logger.mjs'
import { readFileSync } from 'node:fs'
import ResourceMonitor from './resource-monitor.mjs'
import ConsoleLogger from "./loggers/consoleLogger.js";
const logger = createLogger('Init')

export default {

  /**
   * Initializes the server.
   * Calls the applicationLoader function to get an Application instance and then initializes various server components based on the configuration.
   *
   * @param {function(typeof Application): Application} applicationLoader  - A function that receives the Application class and returns an instance of it.
   *
   * @throws {TypeError} If the provided applicationLoader does not return an instance of Application.
   * @throws {Error} If the jobManager is disabled when running in 'job' mode.
   */
  async init (applicationLoader) {
    try {
      const application = applicationLoader(Application)

      if (!(application instanceof Application)) {
        // noinspection ExceptionCaughtLocallyJS
        throw new TypeError('application must be instance of Application')
      }

      /**
       * The command passed to the server via command-line arguments.
       * This variable determines the mode in which the server operates.
       * It affects the initialization and running of various server components.
       *
       * @type {string}
       */
      const command = process.argv[2]

      if (['job', 'job-check'].includes(command)) {
        if (command === 'job-check' && !Config.get('jobManager.enabled', 'boolean')) {
          // noinspection ExceptionCaughtLocallyJS
          throw new Error('jobManager disabled')
        }
        await application.init(['jobs']) // Loads only job-type controllers
        await WorkerRunner.run(application, command === 'job-check')
      } else {
        await application.init()
        await this.initServer(application)
      }
    } catch (error) {
      console.error(error)
      process.exit(1)
    }
  },

  /**
   * Initializes the HTTP, Job, and Socket servers based on the application's configuration.
   * It also initiates resource monitoring and displays application information.
   *
   * @param {Application} application  - The instance of the application to initialize servers for.
   */
  async initServer (application) {
    if (Config.get('monitor.enabled', 'boolean')) {
      BlessedInterface.init()
    }

    if (Config.get('resourceMonitor.enabled', 'boolean')) {
      ResourceMonitor.init()
    }

    this.logInfo(application)
    // Load initializers
    for (const controller of application.getControllers('core')) {
      try {
        await controller.setup()
      } catch (e) {
        logger.error(`Error initializing controller "${controller.completeIndentification}": ${e.message}`)
        throw e
      }
    }

    // Order is important
    if (Config.get('httpServer.enabled', 'boolean')) {
      await HttpServer.run(application)
    }

    if (Config.get('jobManager.enabled', 'boolean')) {
      await JobManager.run(application)
    }

    if (Config.get('socket.enabled', 'boolean')) {
      await SocketServer.run(application)
    }

    // New HTTP server implementation based on Fastify and inspired by NestJS
    if (Config.get('httpServer2.enabled', 'boolean')) {
      const logger = new ConsoleLogger();
      const httpServer2 = new HttpServer2(logger);
      httpServer2.run(application);
    }

  },

  /**
   * Logs the startup information of the application including Node, system details, and application version.
   *
   * @param {Application} application  - The instance of the application to log information for.
   */
  logInfo (application) {
    const filePath = new URL('../package.json', import.meta.url)
    const packageInfo = JSON.parse(readFileSync(filePath, 'utf8'))

    logger.info('\n' + figlet.textSync('Node Framework'))
    logger.info('\n' + figlet.textSync(`\n${sentenceCase(application.name)}`))
    logger.info('==============================================================')
    logger.info(`Project:                 ${application.name}`)
    logger.info(`Root Path:               ${application.path}`)
    logger.info(`Node Version:            ${process.version}`)
    logger.info(`Environment:             ${process.env.NODE_ENV}`)
    logger.info(`Pid:                     ${process.pid}`)
    logger.info(`Hostname:                ${os.hostname()}`)
    logger.info(`Platform:                ${os.platform()}`)
    logger.info(`Arch:                    ${os.arch()}`)
    logger.info(`Node Framework Version:  ${packageInfo.version}`)
    logger.info(`Application Version:     ${process.env.npm_package_version}`)
    logger.info('==============================================================')
  }
}
