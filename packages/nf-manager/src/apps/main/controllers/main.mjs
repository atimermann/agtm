/**
 * **Created on 10/08/2023**
 *
 * apps/main/controllers/main.mjs
 * @author André Timermann <andre@timermann.com.br>
 *
 */
import { Controller, createLogger, JobManager, WorkerManager } from '../../../main.mjs'
import { wait } from '@agtm/util'
import NfManagerDatabase from '../services/nf-manager.database.mjs'
import JobExecutionModel from '../models/job-execution.mjs'
import JobExecutionProcessModel from '../models/job-execution-process.mjs'
import JobExecutionProcessLogModel from '../models/job-execution-process-log.mjs'

const logger = createLogger('NFManager')

export default class MainController extends Controller {
  async setup () {
    logger.info('Initializing SQLite Database...')
    await NfManagerDatabase.initDatabase()

    logger.info('Creating database structure...')
    await NfManagerDatabase.createTables()

    logger.info('Configuring events...')

    // TODO: Adicionar em um Service
    // TODO: Migrar para KNEXJS
    // TODO: Separar serviço database em models
    // TODO: Limpeza de Log
    // TODO: Criar tabela para salvar Worker para ecominizar espaço nba tabela JobExecution

    // - WORKER só tem horario de inicio, não de fim, horario de fim seria horario de reinicio
    // - WOrkers persistente temos validação e verificação se um dos processoss finalizaram e reinicia
    // - WOrker agendado, ao iniciar um agendamento finaliza todos os ultimos processos
    // - Oq tem inicio e fim são os processos, worker é só um agrupamento de processo
    // - Podemos dizer q worker finaliza quando todos os processos finalizam (caso do agendado)
    // - No persistente sempre q um processo morre ele é reiniciado
    WorkerManager.events.on('run', async worker => {
      logger.debug(`Worker Run - Name:"${worker.name}", RunID: ${worker.runId}`)
      await JobExecutionModel.add(worker)
    })

    WorkerManager.events.on('processRun', async (worker, jobProcess, childProcess) => {
      const executionWorker = await wait(async () => {
        logger.debug(`Get worker Run - RunID: ${childProcess.runId}`)
        return await JobExecutionModel.getIdByRunId(childProcess.runId)
      }, 10000, 1000)

      logger.debug(`Creating jobExecution Process - ExecutionId: ${executionWorker.id} Instance: ${jobProcess.instance}, PID: ${childProcess.pid}`)
      await JobExecutionProcessModel.add(executionWorker.id, jobProcess.instance, childProcess.pid)
    })

    WorkerManager.events.on('processLog', async (worker, jobProcess, childProcess, data) => {
      const jobExecutionProcess = await wait(async () => {
        return await JobExecutionProcessModel.getByPid(childProcess.pid)
      }, 10000, 1000)

      await JobExecutionProcessLogModel.add(jobExecutionProcess, data)
    })

    WorkerManager.events.on('processExit', async (worker, jobProcess, childProcess) => {
      await JobExecutionProcessModel.end(childProcess.pid, childProcess.exitCode)
      await JobExecutionModel.updateStatus(childProcess.runId, worker)
    })
  }

  socket () {
    /**
     * Jobs List
     * Outputs updated information of all jobs
     */
    this.namespace('/jobs').on('connection', async socket => {
      // Atualiza contagem de erro baseado na base de dados
      const jobsInformation = JobManager.getJobsInformation()
      const keys = Object.keys(jobsInformation)

      // TODO: executar apenas uma consulta retornando todos os uuids
      await Promise.all(keys.map(async key => {
        jobsInformation[key].errorCount = await NfManagerDatabase.getJobErrorCountByUUID(jobsInformation[key].uuid)
      }))

      socket.emit('jobsList', jobsInformation)
    })

    /**
     * Job Panel
     */
    this.namespace('/job').on('connection', async socket => {
      const jobUuid = socket.handshake.query.uuid

      // Subscribe to the 'job Uuid' room
      socket.join(`job:${jobUuid}`)

      socket.on('getJobInfo', async (uuid, callback) => {
        try {
          const job = JobManager.getJobByUUID(uuid)

          console.log(`client getJobInfo: ${uuid}`)

          const response = {
            job,
            executions: await NfManagerDatabase.getJobExecutionByUUID(uuid)
          }

          callback(response)
        } catch (e) {
          callback(e)
        }
      })

      socket.on('getProcessList', async (jobExecutionId, callback) => {
        try {
          const processes = await NfManagerDatabase.getProcessListByJobExecutionId(jobExecutionId)
          const response = {
            processes
          }
          callback(response)
        } catch (e) {
          callback(e)
        }
      })

      socket.on('getProcessLog', async (jobExecutionProcessId, callback) => {
        try {
          const logs = await NfManagerDatabase.getJobExecutionProcessLogByjobProcessId(jobExecutionProcessId)

          const response = {
            logs
          }

          callback(response)
        } catch (e) {
          callback(e)
        }
      })
    })
  }
}
