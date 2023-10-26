import SQL from 'sql-template-strings'
import NfManagerDatabase from '../services/nf-manager.database.mjs'

/**
 * Created on 25/10/23
 *
 * packages/nf-manager/src/apps/main/models/job-execution
 * @author André Timermann <andre@timermann.com.br>
 *
 */
export default class JobExecutionModel {
  static async add (worker) {
    const runResult = await NfManagerDatabase.db.run(
      SQL`INSERT INTO jobExecution (jobUuid, workerName, runId)
          VALUES (${worker.job.uuid}, ${worker.name}, ${worker.runId});`
    )
    return await NfManagerDatabase.db.get(
      SQL`SELECT *
          FROM jobExecution
          WHERE id = ${runResult.lastID};`
    )
  }

  static async getIdByRunId (runId) {
    return await NfManagerDatabase.db.get(
      SQL`SELECT id
          FROM jobExecution
          WHERE runId = ${runId};`
    )
  }

  /**
   * Atualiza status
   *
   * @param {string}  runId
   * @param {Worker} worker
   * @returns {Promise<void>}
   */
  static async updateStatus (runId, worker) {
    // TODO: Adicionar contador de erro aqui, importante, somando de todas as instancias
    // TODO: Limitar quantidade de erro

    const executionsProcesses = await NfManagerDatabase.db.all(
      SQL`SELECT jep.status
            FROM jobExecutionProcess jep
                     INNER JOIN jobExecution je ON jep.jobExecutionId = je.id
            WHERE je.runId = ${runId};`
    )

    let hasError = false
    let running = false
    for (const executionsProcess of executionsProcesses) {
      if (executionsProcess.status === 'X') running = true
      if (executionsProcess.status === 'E') hasError = true
    }

    await NfManagerDatabase.db.run(
      SQL`UPDATE jobExecution
        SET hasError = ${hasError}, running = ${running}
        WHERE runId = ${runId};`
    )

    if (!running && !worker.persistent) {
      await NfManagerDatabase.db.run(
        SQL`UPDATE jobExecution
        SET endAt = CURRENT_TIMESTAMP
            WHERE runId = ${runId};`
      )
    }
  }
}
