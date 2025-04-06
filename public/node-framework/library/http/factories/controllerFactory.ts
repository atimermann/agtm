/**
 * **Created on 31/03/2025**
 *
 * @author André Timermann <andre@timermann.com.br>
 *
 * @file
 *  Cria instancias de controller
 *
 */

import { ApiController } from "../apiController.ts"
import type { UserClassFileDescription } from "#/http/services/userApiFilesService.ts"
import type { AutoSchema } from "../autoSchema.ts"
import type { ApiAuto } from "#/http/apiAuto.js"
import type { LoggerService } from "#/services/loggerService.ts"
import type { ConfigService } from "#/services/configService.js"
import type { PrismaService } from "#/services/prismaService.js"
import type { FastifyInstance } from "fastify"
import type { PrismaClient } from "@prisma/client"
import { validateInstance } from "#/http/services/userApiFilesService.ts"

export class ControllerFactory {
  constructor(
    private readonly logger: LoggerService,
    private readonly config: ConfigService,
    private readonly prismaService: PrismaService,
    private readonly fastify: FastifyInstance,
  ) {}

  /**
   * Cria e configura um controller.
   * Se existir um descriptor de controller nos fileDescriptors, carrega o módulo customizado;
   * caso contrário, utiliza o ApiController padrão.
   *
   * @param appName         - Nome da aplicação
   * @param fileDescriptors - Lista de descritores de arquivos para a rota
   * @param autoSchema      - (Opcional) AutoSchema para configuração automática
   * @param autoApi         - (Opcional) ApiAuto customizado para o controller
   *
   * @returns Uma instância configurada do controller.
   */
  async create(
    appName: string,
    fileDescriptors: UserClassFileDescription[],
    autoSchema?: AutoSchema,
    autoApi?: ApiAuto,
  ) {
    const controllerDescriptor = fileDescriptors.find((file) => file.type === "controller")

    let controllerFile
    if (controllerDescriptor) {
      controllerFile = await import(controllerDescriptor.path)
      if (!controllerFile.default) {
        throw new Error(
          `Controller "${controllerDescriptor.name}" at ${appName} must export class default. Named export is not supported.`,
        )
      }
    }

    const ControllerClass: typeof ApiController = controllerDescriptor ? controllerFile.default : ApiController

    const prismaInstance: PrismaClient = this.prismaService.getInstance()

    const controller = new ControllerClass(
      this.logger,
      this.config,
      this.prismaService,
      prismaInstance,
      this.fastify,
      appName,
      autoSchema,
      autoApi,
    )

    validateInstance(controller, "__ApiController", controllerDescriptor)
    await controller.setup()
    return controller
  }
}
