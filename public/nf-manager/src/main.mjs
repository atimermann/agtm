/**
 * **Created on 10/08/2023**
 *
 * main.mjs
 * @author André Timermann <andre@timermann.com.br>
 *
 * Framework Manager, a web interface for the management of framework components, including the job scheduling system,
 * databases, logs, machine resource utilization, sockets, and other related elements
 *
 */
import { __dirname } from '@agtm/util'

let Application, createLogger, Config, ApplicationController, Controller, JobManager, WorkerManager

export default function applicationLoader (BaseApplication) {
  ({
    createLogger,
    ApplicationController,
    Controller,
    JobManager,
    WorkerManager,
    Config
  } = BaseApplication.getLibraries())

  return new BaseApplication(__dirname(import.meta.url), 'nfManager')
}

export {
  Application,
  createLogger,
  Config,
  ApplicationController,
  Controller,
  JobManager,
  WorkerManager
}
