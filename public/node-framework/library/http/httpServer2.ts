import type { LoggerInterface } from "../loggers/logger.interface.ts"
import Fastify from "fastify"
import { resolve, join, relative } from "node:path"
import * as fs from "node:fs/promises"

import cors from "@fastify/cors"

import { HttpRouter } from "./httpRouter.ts"
import type { FastifyInstance } from "fastify"
import ApiGenerator from "./apiGenerator.ts"

const APP_DIR = resolve(process.cwd(), "src/apps")

export type UserClassFileDescription = {
  path: string
  app: string
  id: string
  type?: string
}

export default class HttpServer {
  private readonly logger: LoggerInterface
  private readonly server: FastifyInstance

  /**
   * Construtor
   *
   * @param logger
   */
  constructor(logger: LoggerInterface) {
    this.logger = logger

    // TODO: Configurar Fastify para usar nosso logger
    this.server = Fastify({
      logger: true,
      ajv: {
        customOptions: {
          allErrors: true, // Permite exibir todos os erros de validação
        },
      },
    })
  }

  /**
   * Inicia Servidor httpServer2 (baseado no Fastify, especializado em API Rest)

   * @param application   Application Legada
   * @param port          Porta do servidor (TODO Mudar para carregar do config/env)
   */
  async run(application, port = 3001) {
    await this.server.register(cors, {
      // Permite todas as origens
      origin: true,
    })

    this.server.get("/ping", async (request, reply) => {
      return {
        message: "Server is running!",
        time: reply.elapsedTime,
        ip: request.ip,
        protocol: request.protocol,
      }
    })

    await this.generateAutoRoutes()
    // TODO: validar se rota já foi carregado pelo autoRoute
    await this.loadRouters()

    this.server.get("/info", async (request, reply) => {
      return "TODO: Exibe todos os dados das rotas, controllers, schemas carregado para depuração"
    })

    try {
      // Inicia o servidor
      await this.server.listen({ port, host: "0.0.0.0" })
      this.logger.info(`Server started on http://0.0.0.0:${port}`)
    } catch (err) {
      this.logger.error("Error starting server: " + err)
      process.exit(1)
    }
  }

  /**
   *  Carrega todos os rotas definidos pelos apps
   */
  private async loadRouters() {
    const files = await this.findUserClassFilesInAppDir(APP_DIR, /\.routes\.ts$/)

    for (const fileDescription of files) {
      const { path, app } = fileDescription
      this.logger.debug(`Importing router from app: '${app}', file: '${path}'`)

      const RouterClass = (await import(path)).default

      if (!(RouterClass.prototype instanceof HttpRouter)) {
        this.logger.error(`Skipped file '${path}' in app '${app}' as it is not a valid HttpRouter`)
        continue
      }

      // TODO: Carregar controller e schema antes de eniar para router
      // const routerClass: HttpRouterInterface = new RouterClass(this.server, this.logger, fileDescription)
      // await routerClass.setup()
      this.logger.debug(`Loaded routes from '${path}' for app '${app}'`)
    }
  }

  /**
   *  Carrega Descrição de todos os arquivos usados para instanciar clases do usuário
   *
   *  TODO: Simplificar / Reformatar / separar em métodos ou até criar uma classe só pra ele
   *
   * @param AppDirPath    Caminho do diretório onde os apps estão localizados
   * @param filePattern   Expressã regular que define extensão dos arquivos que serão carregados
   */
  private async findUserClassFilesInAppDir(
    AppDirPath: string,
    filePattern: RegExp,
  ): Promise<UserClassFileDescription[]> {
    const AppsDirectories = await fs.readdir(AppDirPath, {
      withFileTypes: true,
    })
    const userClassFileDescriptions: UserClassFileDescription[] = []

    for (const appDirectory of AppsDirectories) {
      this.logger.debug(`Loading App: '${appDirectory.name}'...`)
      const appName = appDirectory.name

      if (appDirectory.isDirectory()) {
        const appDirectoryEntries = await fs.readdir(join(AppDirPath, appDirectory.name), {
          withFileTypes: true,
        })

        for (const appDirectoryEntry of appDirectoryEntries) {
          const appDirectoryEntryPath = join(AppDirPath, appDirectory.name, appDirectoryEntry.name)

          if (appDirectoryEntry.name === "http") {
            const httpFiles = await fs.readdir(appDirectoryEntryPath, {
              withFileTypes: true,
            })

            for (const httpFile of httpFiles) {
              const httpFilePath = join(appDirectoryEntryPath, httpFile.name)

              // Loading Router:
              if (!httpFile.isDirectory() && filePattern.test(httpFile.name)) {
                this.logger.debug(`Loading user file class: '${httpFile.name}'...`)

                const routerId = `${appName}/${httpFile.name}`
                this.logger.info(`ID: "${routerId}`)

                userClassFileDescriptions.push({
                  id: routerId,
                  path: httpFilePath,
                  app: appName,
                })
              }
            }
          }
        }
      }
    }

    this.logIdSchemaMap(userClassFileDescriptions)

    return userClassFileDescriptions
  }

  /**
   *  Imprime tabela de referencia de id para cada rota, pode ser usada para configurar o schema
   *
   * @param userClassFileDescriptions   Descritor do arquivo carregado
   */
  private logIdSchemaMap(userClassFileDescriptions: UserClassFileDescription[]) {
    userClassFileDescriptions.forEach((item) => {
      this.logger.info("------------ ID Schema Map --------------------")
      this.logger.info(`App:    ${item.app}`)
      this.logger.info(`Route:  ${relative(process.cwd(), item.path)}`)
      this.logger.info(`#ID:    ${item.id}`)
    })
    this.logger.info("--------------------------------------------------")
  }

  /**
   * Gera rotas automaticamente baseado nos arquivos .auto.ts, estentendo caso necessário
   */
  private async generateAutoRoutes() {
    const files = await this.findUserClassFilesInAppDir(APP_DIR, /\.auto\.json$/)

    for (const fileDescription of files) {
      const apiGenerator = new ApiGenerator(this.logger, this.server)
      await apiGenerator.generate(fileDescription)
    }
  }
}
