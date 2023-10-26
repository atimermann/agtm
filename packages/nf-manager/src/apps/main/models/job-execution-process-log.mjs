import SQL from 'sql-template-strings'
import NfManagerDatabase from '../services/nf-manager.database.mjs'

/**
 * Created on 25/10/23
 *
 * packages/nf-manager/src/apps/main/models/job-execution
 * @author André Timermann <andre@timermann.com.br>
 *
 */
export default class JobExecutionProcessLogModel {
  static async add (jobExecutionProcess, data) {
    const log = JSON.parse(data)

    if (log.level && log.message) {
      const runResult = await NfManagerDatabase.db.run(
        SQL`INSERT INTO jobExecutionProcessLog (jobExecutionProcessId, level, message)
                VALUES (${jobExecutionProcess.id}, ${log.level}, ${log.message});`
      )

      return await NfManagerDatabase.db.get(
        SQL`SELECT *
                FROM jobExecutionProcessLog
                WHERE id = ${runResult.lastID};`
      )
    }
  }
}
