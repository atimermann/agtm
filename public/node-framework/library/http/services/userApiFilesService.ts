/**
 * Created on 16/02/2025
 *
 * @author André Timermann <andre@timermann.com.br>
 *
 * @file
 * Responsável por localizar e retornar todos os arquivos relevantes para instanciar classes do usuário.
 *
 */

import type { LoggerService } from "#/services/loggerService.js"
import { promises as fs } from "node:fs"
import { resolve, join, parse } from "node:path"
import { groupBy } from "lodash-es"

/**
 * Diretório de configuração de api do usuário
 * TODO: Parametrizar no .env (tem em outros locais no código duplicado)
 */
const APP_DIR = resolve(process.cwd(), "src/apps")

/**
 * REGEXP para obter os tipos de arquivos desejado para montar o descriptor
 */
const REG_SEARCH = /\.(auto\.json|schema\.ts|router\.ts|controller\.ts|auto\.ts)$/

/**
 * Mapa dos tipos de arquivo encontrado
 */
const typeMap: Record<string, string> = {
  ".auto.json": "auto",
  ".schema.ts": "schema",
  ".controller.ts": "controller",
  ".router.ts": "router",
  ".auto.ts": "custom-auto",
}

export type UserClassFileDescription = {
  path: string
  appName?: string
  name?: string
  id?: string
  type?: string
}

export type UserClassFilesGrouped = Record<string, UserClassFileDescription[]>

export class UserApiFilesService {
  constructor(private readonly logger: LoggerService) {}

  async getApps() {
    const appsDirectories = await fs.readdir(APP_DIR, { withFileTypes: true })

    const apps = []

    for (const appDirectory of appsDirectories) {
      if (appDirectory.isDirectory()) {
        apps.push(appDirectory)
      }
    }

    return apps
  }

  /**
   * Retorna uma lista com a descrição de todos os arquivos usados para instanciar classes do usuário. no App definido
   *
   * @param appName - Nome da Aplicação
   * @param appPath - Caminho da aplicação
   */
  async getFilesDescriptors(appName: string, appPath: string): Promise<UserClassFilesGrouped> {
    const appDirectoryEntries = await fs.readdir(appPath, {
      withFileTypes: true,
    })

    const userApiFilesDescriptors: UserClassFileDescription[] = []

    for (const appDirectoryEntry of appDirectoryEntries) {
      const appDirectoryEntryPath = join(appPath, appDirectoryEntry.name)

      if (appDirectoryEntry.name === "http") {
        await this.findUserClassFilesInDirectory(userApiFilesDescriptors, appDirectoryEntryPath, appName)
      }
    }

    return groupBy(userApiFilesDescriptors, "name")
  }

  /**
   * Busca arquivos dentro de um diretório específico que correspondam ao padrão especificado.
   *
   * @param fileList Lista acumulativa dos arquivos encontrados.
   * @param directoryPath Caminho do diretório a ser pesquisado.
   * @param appName Nome do aplicativo ao qual os arquivos pertencem.
   */
  private async findUserClassFilesInDirectory(
    fileList: UserClassFileDescription[],
    directoryPath: string,
    appName: string,
  ): Promise<void> {
    const entries = await fs.readdir(directoryPath, { withFileTypes: true })

    for (const entry of entries) {
      const fullPath = join(directoryPath, entry.name)

      if (entry.isDirectory()) {
        await this.findUserClassFilesInDirectory(fileList, fullPath, appName)
        continue
      }

      this.addUserApiFile(fileList, entry.name, fullPath, appName)
    }
  }

  /**
   * Verifica se o arquivo corresponde ao padrão e adiciona à lista de arquivos relevantes.
   *
   * @param fileName Nome do arquivo a ser verificado.
   * @param path Caminho completo do arquivo.
   * @param fileList Lista acumulativa dos arquivos encontrados.
   * @param appName Nome do aplicativo ao qual os arquivos pertencem.
   */
  private addUserApiFile(fileList: UserClassFileDescription[], fileName: string, path: string, appName: string): void {
    if (!REG_SEARCH.test(fileName)) return

    const id = `${appName}/${fileName}`
    const type = Object.entries(typeMap).find(([ext]) => fileName.endsWith(ext))?.[1] ?? ""
    // Extrai o nome do arquivo sem a extensão
    const name = parse(parse(fileName).name).name

    if (fileList.some((file) => file.id === id)) {
      throw new Error(`Duplicate file detected: ${id}`)
    }

    fileList.push({ appName, name, id, type, path })
  }
}
