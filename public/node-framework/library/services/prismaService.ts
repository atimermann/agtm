/**
 * **Created on 18/03/2025**
 * @author André Timermann <andre@timermann.com.br>
 *
 * @file
 * Serviço de gerencia conexões com ORM PRISMA
 *
 * TODO: Por enquanto suporta apenas conexão unica e configuração padrão
 *
 * - Vamos user apenas uma instancia do PRISMA, se um dia precisar de mais instancia será necessário criar mais schema:
 *   - output          = "./generated/client1" no schema definindo um diretório (gera apartir do diretório prisma)
 *   - Definir no config yaml o caminho para esse cliente
 *   - Criar um client para cada caminho
 *   - Configurar o ENV para suportar mais de um:
 *     ex:
 *     - NF_PRISMA_DEFAULT_CLIENT_PATH="generated/client" (esse deve ficar no yaml)
 *       NF_PRISMA_DEFAULT_PROVIDER="postgresql"          (esse também)
 *       NF_PRISMA_DEFAULT_HOST="localhost"               (daqui pra baixo no ENV)
 *       NF_PRISMA_DEFAULT_PORT="30100"
 *       NF_PRISMA_DEFAULT_DATABASE=""
 *       NF_PRISMA_DEFAULT_USERNAME=""
 *       NF_PRISMA_DEFAULT_PASSWORD=""
 *       NF_PRISMA_DEFAULT_OPTIONS="schema=public"
 *
 */

import { join } from "node:path"
import LoggerService from "#/services/loggerService.js"
import { ConfigService } from "#/services/configService.js"
import type { PrismaClient } from "@prisma/client"

/**
 * PrismaService provides a global dynamically loaded PrismaClient instance.
 * It manages a single connection instance with Prisma.
 */
export class PrismaService {
  public prisma: PrismaClient // Ideally, use PrismaClient type if available.
  private logger: LoggerService
  private config: ConfigService

  /**
   * Creates an instance of PrismaService.
   *
   * @param logger - Instance of LoggerService.
   * @param config - Instance of ConfigService.
   */
  constructor(logger: LoggerService, config: ConfigService) {
    this.logger = logger
    this.config = config
  }

  /**
   * Dynamically imports the PrismaClient from the installed node_modules.
   *
   * @returns {Promise<any>} The PrismaClient instance.
   */
  private async importPrismaClient(): Promise<PrismaClient> {
    const pathToPrismaClient = join(process.cwd(), "node_modules", "@prisma/client")
    const { PrismaClient } = await import(`${pathToPrismaClient}/default.js`)

    const prisma = new PrismaClient({
      log: [
        { level: "query", emit: "event" },
        { level: "info", emit: "event" },
        { level: "warn", emit: "event" },
        { level: "error", emit: "event" },
      ],
    })

    /*
          TODO: Por enquanto vamos imprimir bonito no terminal. Mas no futuro criar uma interface de desenvolvimento
           e produção e enviar consulta para lá
     */
    prisma.$on("query", async (e: any) => {
      this.logger.debug(`\n----------------------------------------------------
\x1b[1;34mQuery\x1b[0m (${e.duration}ms):
    ${e.query}
\x1b[1;34mParams\x1b[0m:
    ${e.params}
----------------------------------------------------`)

      // TODO: demora muito para calcular e é assíncrono, trabalhar quando tiver uma interface propria
      // this.logger.debug(await this.getFormattedMetrics())
    })

    return prisma
  }

  /**
   * Initializes the Prisma client and connects to the database.
   */
  async init(): Promise<void> {
    this.prisma = await this.importPrismaClient()
    await this.prisma.$connect()
    this.logger.info("Prisma connected")
  }

  /**
   * Retorna uma instancia prisma
   * @param instanceName
   */
  getInstance(instanceName?: string): PrismaClient {
    //TODO: Se não definido retorna uma instancia padrão, (nao implementado ainda)

    if (!this.prisma) {
      throw new Error("Prisma Service has not started yet, execute await init() method")
    }

    return this.prisma
  }

  /**
   * Disconnects the Prisma client from the database.
   */
  async disconnect(): Promise<void> {
    if (this.prisma) {
      await this.prisma.$disconnect()
      this.logger.info("Prisma disconnected")
    }
  }

  /**
   * Retrieves Prisma metrics in JSON format.
   *
   */
  async getMetrics(): Promise<any> {
    if (!this.prisma) {
      throw new Error("Prisma client not initialized. Please call setup() first.")
    }
    return await this.prisma.$metrics.json()
  }

  /**
   * Retrieves a summarized string of Prisma metrics for log output.
   *
   * The returned string contains minimal data to fit in a single log line.
   *
   * @returns {Promise<string>} A summarized string with key Prisma metrics.
   */
  async getFormattedMetrics(): Promise<string> {
    const metrics = await this.getMetrics()
    const counters = metrics.counters || []
    const gauges = metrics.gauges || []

    const clientQueriesTotal = counters.find((m: any) => m.key === "prisma_client_queries_total")?.value || 0
    const datasourceQueriesTotal = counters.find((m: any) => m.key === "prisma_datasource_queries_total")?.value || 0
    let poolConnectionsOpen = counters.find((m: any) => m.key === "prisma_pool_connections_open")?.value
    if (poolConnectionsOpen === undefined) {
      poolConnectionsOpen = gauges.find((m: any) => m.key === "prisma_pool_connections_open")?.value || 0
    }

    return `Prisma Metrics: clientQueries=${clientQueriesTotal}, datasourceQueries=${datasourceQueriesTotal}, poolOpen=${poolConnectionsOpen}`
  }
}
