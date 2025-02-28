/**
 * **Created on 27/01/2023**
 *
 * index.mjs
 *
 * @file Main entry point for the Server application, handling imports and exports of core functionalities.
 * @author André Timermann <andre@timermann.com.br>
 *
 * @typedef { import("./library/api/model.mjs").ApiResponse } ApiResponse
 */

import Application from "./library/application.mjs"
import ApplicationController from "./library/application-controller.mjs"
import Server from "./library/server.mjs"
import createLogger from "./library/logger.mjs"
import Config from "./library/config.mjs"
import JobsController from "./library/controller/jobs.mjs"
import SocketController from "./library/controller/socket.mjs"
import HttpController from "./library/controller/http.mjs"
import CoreController from "./library/controller/core.mjs"
import checkExecution from "./library/check-execution.mjs"
import JobManager from "./library/jobs/job-manager.mjs"
import WorkerManager from "./library/jobs/worker-manager.mjs"
import YupValidation from "./library/api/yup-validation.mjs"
import Model from "./library/api/model.mjs"

const logger = createLogger()

export {
  Application,
  Server,
  createLogger,
  logger,
  Config,
  ApplicationController,
  JobsController,
  HttpController,
  CoreController,
  SocketController,
  checkExecution,
  JobManager,
  WorkerManager,
  YupValidation,
  Model,
}

////////////////////////////////////
// New format
////////////////////////////////////
export { ApiRouter } from "./library/http/apiRouter.ts"
export { ApiController } from "./library/http/apiController.ts"
