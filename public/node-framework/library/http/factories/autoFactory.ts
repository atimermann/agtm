/**
 * Created on 30/03/2025
 *
 * @author André Timermann <andre@timermann.com.br>
 *
 * @file
 *  Factory responsável por criar instâncias de ApiAuto
 *
 */
import { resolve } from "node:path"
import { ApiAuto } from "#/http/apiAuto.ts"
import { AutoSchemaService } from "#/http/services/autoSchemaService.ts"
import { PrismaService } from "#/services/prismaService.ts"
import { ConfigService } from "#/services/configService.ts"
import type { LoggerInterface } from "#/loggers/logger.interface.ts"
import type { AutoSchema } from "../autoSchema.ts"
import {
  UserClassFileDescription,
  UserClassFilesGrouped,
  validateInstance,
} from "#/http/services/userApiFilesService.ts"
import { LoggerService } from "#/services/loggerService.ts"

export class AutoFactory {
  constructor(
    private readonly logger: LoggerInterface,
    private readonly prismaService: PrismaService,
  ) {}

  /**
   * Instância de autoApi só faz sentido se autoSchema tiver definido
   *
   * Cria e retorna uma instância de ApiAuto baseado no "Auto Schema".
   * Se o schema tiver definido uma propriedade "auto", tenta carregar um ApiAuto customizado.
   * Se não definido, mas descriptorName estiver definido, tenta carregar um custom ApiAuto usando o descriptorName.
   * Se não encontrar nenhum customizado, retorna o ApiAuto padrão.
   *
   * @param appName                 - Nome da aplicação
   * @param descriptorName          - Nome do módulo autoApi
   * @param groupedFilesDescriptors - Arquivos agrupados contendo os módulos customizados de ApiAuto.
   * @param autoSchema              - Schema que descreve o ApiAuto gerado
   *
   * @returns Uma instância de ApiAuto.
   */
  async create(
    appName: string,
    descriptorName: string,
    groupedFilesDescriptors: UserClassFilesGrouped,
    autoSchema?: AutoSchema,
  ) {
    if (!autoSchema) {
      return
    }

    let userApiAuto: ApiAuto | false = false

    if (autoSchema.auto) {
      userApiAuto = await this.createUserAutoApi(appName, autoSchema.auto, autoSchema, groupedFilesDescriptors)
      if (!userApiAuto) {
        throw new Error(`AutoApi "${autoSchema.auto}" defined in Schema not found.`)
      }
    }

    userApiAuto = await this.createUserAutoApi(appName, descriptorName, autoSchema, groupedFilesDescriptors)
    if (userApiAuto) {
      return userApiAuto
    }

    return new ApiAuto(this.logger, autoSchema, this.prismaService)
  }

  /**
   * Gera uma nova instância de ApiAuto standalone, que pode ser usada fora do fluxo do node-framework.
   *
   * @param schemaFilePath - Caminho do schema Auto (relativo ou absoluto)
   * @returns Uma instância de ApiAuto.
   */
  static async createFromSchema(schemaFilePath: string): Promise<ApiAuto> {
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

    return new ApiAuto(logger, autoSchema, prismaService)
  }

  /**
   * Cria uma instância personalizada de ApiAuto a partir do nome informado.
   * Busca o arquivo dentro de groupedFilesDescriptors
   *
   * @param appName                 - Nome da aplicação
   * @param autoName                - Nome do autoApi, por exemplo para "account.auto.ts" seria "account". é o mesmo
   *                                  valor de schema.auto se definido
   * @param autoSchema              - Schema usado para gerar o ApiAuto
   * @param groupedFilesDescriptors - Classes do usuário usado para gerar api, onde será procurado o autoApi agrupado
   *
   * @returns Uma instância de ApiAuto customizado, ou false se não encontrado.
   */
  private async createUserAutoApi(
    appName: string,
    autoName: string,
    autoSchema: AutoSchema,
    groupedFilesDescriptors: UserClassFilesGrouped,
  ) {
    let UserAutoApi: typeof ApiAuto | undefined
    let autoApiFile: UserClassFileDescription | undefined

    for (const [, files] of Object.entries(groupedFilesDescriptors)) {
      autoApiFile = files.find((file) => {
        return file.name === autoName && file.type === "custom-auto"
      })

      if (autoApiFile) {
        const userAutoApiModule = await import(autoApiFile.path)
        if (!userAutoApiModule.default) {
          throw new Error(
            `Autoapi "${autoName}" at ${appName} must export class default. Named export is not supported.`,
          )
        }
        UserAutoApi = userAutoApiModule.default
      }
    }

    if (UserAutoApi) {
      const userAutoApi = new UserAutoApi(this.logger, autoSchema, this.prismaService)
      validateInstance(userAutoApi, "__ApiAuto", autoApiFile)
      return userAutoApi
    }
    return false
  }
}
