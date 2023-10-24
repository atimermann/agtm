/**
 * **Created on 10/08/2023**
 *
 * apps/main/controllers/main.mjs
 * @author André Timermann <andre@timermann.com.br>
 *
 */
import { Controller, createLogger, JobManager, WorkerManager } from '../../../main.mjs'
import NfManagerDatabase from '../services/nf-manager.database.mjs'

const logger = createLogger('NFManager')

export default class MainController extends Controller {
  async setup () {
    logger.info('Initializing SQLite Database...')
    await NfManagerDatabase.initDatabase()

    logger.info('Creating database structure...')
    await NfManagerDatabase.createTables()

    /**
     * Apenas é possível uma execução por vez, verifica qual execução atual
     */
    const currentExecution = {}

    logger.info('Configuring events...')

    // TODO: Adicionar em um Service
    // TODO: Disparado quando nova execução é iniciada
    // TODO: Migrar para KNEXJS
    // TODO: Separar serviço database em models
    // TODO: Melhorar o log e verificações para detectar futuros erros
    // TODO: Limpeza de Log
    // TODO: Criar tabela para salvar Worker para ecominizar espaço nba tabela JobExecution
    // TODO: Configurar os endsAt
    // TODO: Calculo de duração
    // TODO: Calculo de status de execuções e processos

    // - WORKER só tem horario de inicio, não de vim, horario de fim seria horario de reinicio
    // - WOrkers persistente temos validação e verificação se um dos processoss finalizaram e reinicia
    // - WOrker agendado, ao iniciar um agendamento finaliza todos os ultimos processos
    // - Oq tem inicio e fim são os processos, worker é só um agrupamento de processo
    // - Podemos dizer q worker finaliza quando todos os processos finalizam (caso do agendado)
    // - No persistente sempre q um processo morre ele é reiniciado
    WorkerManager.events.on('run', async worker => {
      currentExecution[worker.name] = await NfManagerDatabase.addJobExecution(worker)

      // Cadastra todas os processos q executa o log
      for (const process of worker.jobProcesses) {
        await NfManagerDatabase.addJobExecutionProcess(currentExecution[worker.name], process)
      }
    })

    WorkerManager.events.on('processLog', async (worker, jobProcess, data) => {
      await NfManagerDatabase.addJobExecutionProcessLog(currentExecution[worker.name], jobProcess, data)
    })

    // Registra erros no processamento
    // TODO: Remover, usar processLog
    // WorkerManager.events.on('processError', async (worker, jobProcess) => {
    //   const jobData = await NfManagerDatabase.addProcessError(jobProcess)
    //
    //   this.namespace('/job')
    //     .to(`job:${jobData.uuid}`)
    //     .emit(
    //       'processError',
    //       jobData
    //     )
    // })
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
        const job = JobManager.getJobByUUID(uuid)

        console.log(`client getJobInfo: ${uuid}`)

        const response = {
          job,
          executions: await NfManagerDatabase.getJobExecutionByUUID(uuid)
        }

        callback(response)
      })

      socket.on('getProcessList', async (jobExecutionId, callback) => {
        const processes = await NfManagerDatabase.getProcessListByJobExecutionId(jobExecutionId)

        const response = {
          processes
        }

        callback(response)
      })

      socket.on('getProcessLog', async (jobExecutionProcessId, callback) => {
        const logs = await NfManagerDatabase.getJobExecutionProcessLogByjobProcessId(jobExecutionProcessId)

        const response = {
          logs
        }

        callback(response)
      })

      // // Send all current errors
      // socket.emit(
      //   'allProcessError',
      //   await NfManagerDatabase.getRecordsByUUID(jobUuid)
      // )
    })
  }
}
