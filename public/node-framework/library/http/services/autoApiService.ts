/**
 * Created on 24/02/2025
 *
 * @author André Timermann <andre@timermann.com.br>
 *
 * @file
 * Responsável automatizar os controllers, gerando as consultas ao banco de dados automaticamente de acordo com o
 *  AutoSchema
 *
 */
import { LoggerService } from "#/services/loggerService.ts"
import type { AutoSchema } from "../autoSchema.ts"
import type { FieldSchemaInterface } from "#/http/interfaces/schemas/autoSchema/fieldsSchema.interface.ts"

import { resolve } from "node:path"
import AutoSchemaService from "#/http/services/autoSchemaService.js"
import { PrismaService } from "#/services/prismaService.js"
import { ConfigService } from "#/services/configService.js"
import { AutoApi } from "#/http/autoApi.js"
import { LoggerInterface } from "#/loggers/logger.interface.js"
import { UserClassFilesGrouped } from "#/http/services/userApiFilesService.js"

/**
 * Diretório de configuração de api do usuário
 * TODO: Parametrizar no .env (tem em outros locais no código duplicado)
 */
const APP_DIR = resolve(process.cwd(), "src/apps")

export class AutoApiService {
  async create(
    logger: LoggerInterface,
    autoSchema: AutoSchema,
    prismaService: PrismaService,
    userApiFiles: UserClassFilesGrouped,
  ): Promise<AutoApi> {

    

    return new AutoApi(logger, autoSchema, prismaService)
  }

  /**
   * Gera uma nova instancia apiService standalone, pode ser usada fora do fluxo do node-framework
   *
   * @param schemaFilePath  Caminho do schema Auto (relativo ou absoluto)
   */
  async createFromSchema(schemaFilePath: string): Promise<AutoApi> {
    const logger = new LoggerService()
    const config = new ConfigService()
    const autoSchemaService = new AutoSchemaService(logger)

    // Se o caminho começa com "/", usa diretamente como absoluto.
    // Caso contrário, resolve relativo ao diretório atual.
    const finalPath = schemaFilePath.startsWith("/") ? schemaFilePath : resolve(process.cwd(), schemaFilePath)

    const autoSchema = await autoSchemaService.createAutoSchemaFromFile({
      path: finalPath,
    })

    const prismaService = new PrismaService(logger, config)
    await prismaService.init()

    if (!prismaService) {
      throw new Error("Prisma is not enabled in the project, should be enabled in Config prisma.enabled = True")
    }

    return new AutoApi(logger, autoSchema, prismaService)
  }
}
