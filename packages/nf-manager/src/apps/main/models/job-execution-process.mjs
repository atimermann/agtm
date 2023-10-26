import SQL from 'sql-template-strings'
import NfManagerDatabase from '../services/nf-manager.database.mjs'

/**
 * Created on 25/10/23
 *
 * packages/nf-manager/src/apps/main/models/job-execution
 * @author André Timermann <andre@timermann.com.br>
 *
 */
export default class JobExecutionProcessModel {
  static async add (executionWorkerId, instance, pid) {
    if (!executionWorkerId) throw new Error('executionWorkerId undefined')

    return await NfManagerDatabase.db.run(
      SQL`INSERT INTO jobExecutionProcess (jobExecutionId, instance, pid)
          VALUES (${executionWorkerId}, ${instance}, ${pid});`
    )
  }

  static async getByPid (pid) {
    return await NfManagerDatabase.db.get(
      SQL`SELECT id
          FROM jobExecutionProcess
          WHERE pid = ${pid};`)
  }

  /**
   * Completes process execution
   *
   * @param {number} pid
   * @param {number} code
   * @returns {Promise<void>}
   */
  static async end (pid, code) {
    const status = code === 0 ? 'S' : 'E'

    return await NfManagerDatabase.db.run(
      SQL`UPDATE jobExecutionProcess
        SET endAt = CURRENT_TIMESTAMP, status = ${status}
        WHERE pid = ${pid};`
    )
  }
}
