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

////////////////////////////////////////////////////////////////////////////////////////////////////////////
// New format
// Nota: Não utilizar alias aqui (./library). Problema nos projetos que vão utilizar o módulo
////////////////////////////////////////////////////////////////////////////////////////////////////////////
export { ApiRouter } from "./library/http/apiRouter.js"
export { ApiController } from "./library/http/apiController.ts"
export { ApiAuto } from "./library/http/apiAuto.js"
export { ApiError } from "./library/http/errors/apiError.ts"
export { AutoSchema } from "./library/http/autoSchema.ts"
export type { AuthRequest } from "#/http/interfaces/AuthRequest.ts"
export { LoggerService } from "./library/services/loggerService.ts"
export { PrismaService } from "./library/services/prismaService.ts"
export { AutoFactory } from "./library/http/factories/autoFactory.js"
//TODO:  export tools, faler import { isDev } from "@agtm/node-framework/tools" (provavelmente é config no package.json)
//TODO: Documentar isso
