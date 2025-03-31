/**
 * Created on 24/02/2025
 *
 * @author André Timermann <andre@timermann.com.br>
 *
 * @file
 * Responsável automatizar os controllers, gerando as consultas ao banco de dados automaticamente de acordo com o
 *  AutoSchema
 *
 *  TODO: Transformar em Factory
 *
 */
import { resolve } from "node:path"
import { AutoApi } from "#/http/autoApi.js"
import AutoSchemaService from "#/http/services/autoSchemaService.js"
import { PrismaService } from "#/services/prismaService.js"
import { ConfigService } from "#/services/configService.js"
import { LoggerInterface } from "#/loggers/logger.interface.js"
import type { AutoSchema } from "../autoSchema.ts"
import type { UserClassFilesGrouped } from "#/http/services/userApiFilesService.js"
import { LoggerService } from "#/services/loggerService.js"

export class AutoApiService {
  constructor(
    private readonly logger: LoggerInterface,
    private readonly autoSchema: AutoSchema,
    private readonly prismaService: PrismaService,
    private readonly descriptorName: string,
  ) {}

  /**
   * Cria e retorna uma instância de AutoApi.
   * Se o schema tiver definido uma propriedade "auto", tenta carregar um AutoApi customizado.
   * Se não definido, mas descriptorName estiver definido, tenta carregar um custom AutoApi usando o descriptorName.
   * Se não encontrar nenhum customizado, retorna o AutoApi padrão.
   *
   * @param appName      - Nome da aplicação
   * @param userApiFiles - Arquivos agrupados contendo os módulos customizados de AutoApi.
   * @returns Uma instância de AutoApi.
   */
  async create(userApiFiles: UserClassFilesGrouped) {
    let customApi: AutoApi | false = false
    if (this.autoSchema.auto) {
      customApi = await this.createCustomAutoApi(this.autoSchema.auto, userApiFiles)
      if (!customApi) {
        throw new Error(`AutoApi "${this.autoSchema.auto}" defined in Schema not found.`)
      }
    }

    customApi = await this.createCustomAutoApi(this.descriptorName, userApiFiles)
    if (customApi) {
      return customApi
    }

    return new AutoApi(this.logger, this.autoSchema, this.prismaService)
  }

  /**
   * Gera uma nova instância de AutoApi standalone, que pode ser usada fora do fluxo do node-framework.
   *
   * @param schemaFilePath - Caminho do schema Auto (relativo ou absoluto)
   * @returns Uma instância de AutoApi.
   */
  static async createFromSchema(schemaFilePath: string): Promise<AutoApi> {
    const logger = new LoggerService()
    const config = new ConfigService()
    const autoSchemaService = new AutoSchemaService(logger)

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

  /**
   * Cria uma instância personalizada de AutoApi a partir do nome informado.
   *
   * @param appName
   * @param autoName - Nome usado para buscar o módulo customizado.
   * @param userApiFiles - Arquivos agrupados contendo os módulos customizados de AutoApi.
   * @returns Uma instância de AutoApi customizado, ou false se não encontrado.
   */
  private async createCustomAutoApi(
    autoName: string,
    userApiFiles: UserClassFilesGrouped,
  ): Promise<AutoApi | false> {
    let UserAutoApi = null

    for (const [, files] of Object.entries(userApiFiles)) {
      const autoApiFile = files.find(
        (file) =>  file.name === autoName && file.type === "custom-auto",
      )

      if (autoApiFile) {
        const userAutoApiModule = await import(autoApiFile.path)
        if (userAutoApiModule.default) {
          UserAutoApi = userAutoApiModule.default
          break
        }
      }
    }
    if (UserAutoApi) {
      return new UserAutoApi(this.logger, this.autoSchema, this.prismaService)
    }
    return false
  }
}
