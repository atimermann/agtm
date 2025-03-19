/**
 * **Created on 27/01/2023**
 *
 * index.mjs
 *
 * @file Main entry point for the Server application, handling imports and exports of core functionalities.
 * @author André Timermann <andre@timermann.com.br>
 *
 */

////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Legacy
////////////////////////////////////////////////////////////////////////////////////////////////////////////
import Application from "#/application.mjs"
import ApplicationController from "#/application-controller.mjs"
import Server from "#/server.mjs"
import createLogger from "#/logger.mjs"
import Config from "#/config.mjs"
import JobsController from "#/controller/jobs.mjs"
import SocketController from "#/controller/socket.mjs"
import HttpController from "#/controller/http.mjs"
import CoreController from "#/controller/core.mjs"
import checkExecution from "#/check-execution.mjs"
import JobManager from "#/jobs/job-manager.mjs"
import WorkerManager from "#/jobs/worker-manager.mjs"
import YupValidation from "#/api/yup-validation.mjs"
import Model from "#/api/model.mjs"

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

////////////////////////////////////////////////////////////////////////////////////////////////////////////
// New format
////////////////////////////////////////////////////////////////////////////////////////////////////////////
export { ApiRouter } from "#/http/apiRouter.ts"
export { ApiController } from "#/http/apiController.ts"
export { AutoApiService } from "#/http/services/autoApiService.ts"
export type { ApiRouterInterface } from "#/http/interfaces/apiRouter.interface.ts"
export type { ApiControllerInterface } from "#/http/interfaces/apiController.interface.ts"
