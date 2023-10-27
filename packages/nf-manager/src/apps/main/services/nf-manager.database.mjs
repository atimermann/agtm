/**
 * Created on 07/09/23
 *
 * src/apps/main/services/nf-manager.database.mjs
 * @author André Timermann <andre@timermann.com.br>
 *
 */
import { open } from 'sqlite'
import sqlite3 from 'sqlite3'
import SQL from 'sql-template-strings'

/**
 * Class to facilitate SQLite database management in the project.
 *
 * Aims to simplify database management and structure, avoiding the necessity for migrations,
 * model creations, installing external services like a DBMS, or executing scripts. It is designed
 * to streamline and automate processes like database creation through code using SQLite. If a more
 * complex structure becomes necessary, there's the option to migrate to a more robust database like
 * PostgreSQL or to use Prisma with migration support.
 */
class NfManagerDatabase {
  static db
  /**
   * Initializes the database by opening a connection to SQLite.
   *
   * @static
   * @async
   * @returns {Promise<void>}
   */
  static async initDatabase () {
    console.log('OPEN DB')
    this.db = await open({
      filename: './storage/nfmonitor.sqlite.db',
      driver: sqlite3.cached.Database
    })
  }

  /**
   * Creates the necessary tables in the database if they do not already exist.
   *
   * @static
   * @async
   * @returns {Promise<void>}
   */
  static async createTables () {
    // TODO: MIGRAR PRO KNEXJS (PRISMA não é bom pra criação de tabela dinamicamente)
    // S -> Success, E -> Error, X -> Execution TODO: no model criar constantes documentando

    await this.db.exec(`

    CREATE TABLE IF NOT EXISTS jobError (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      uuid VARCHAR(64),
      jobName TEXT,
      worker TEXT,
      jobInstance INTEGER,
      errorTimestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      errorDescription TEXT,
      note TEXT
    );

    CREATE TABLE IF NOT EXISTS jobExecution (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      jobUuid VARCHAR(64) NOT NULL,
      workerName VARCHAR(64) NOT NULL,
      runId VARCHAR(32) NOT NULL,
      startAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
      endAt TIMESTAMP,
      running BOOLEAN  DEFAULT true NOT NULL,
      hasError BOOLEAN  DEFAULT false NOT NULL
    );

    CREATE TABLE IF NOT EXISTS jobExecutionProcess (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      jobExecutionId INTEGER NOT NULL,
      instance INTEGER NOT NULL,
      pid INTEGER NOT NULL,
      startAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
      endAt TIMESTAMP,
      status CHAR(1) DEFAULT 'X' CHECK( status IN ('S', 'E', 'X') ) NOT NULL,
      FOREIGN KEY (jobExecutionId) REFERENCES jobExecution(id)
    );

    CREATE INDEX IF NOT EXISTS idx_jobExecutionProcess_pid
      ON jobExecutionProcess (pid);

    CREATE TABLE IF NOT EXISTS jobExecutionProcessLog (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      datetime TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
      jobExecutionProcessId INTEGER NOT NULL,
      level VARCHAR(32),
      message TEXT,
      FOREIGN KEY (jobExecutionProcessId) REFERENCES jobExecutionProcess(id)
    );

    `)

    await this.db.exec('CREATE INDEX IF NOT EXISTS uuid_index ON jobError (uuid);')
  }

  //= ===================================================================================================
  // JobExecution TODO: Mover para model
  //= ===================================================================================================

  static async getJobExecutionByUUID (uuid) {
    return (await this.db.all(
      SQL`SELECT *
          FROM jobExecution
          WHERE jobUuid = ${uuid}
          ORDER BY startAt DESC LIMIT 100;`))
      .map(row => ({
        ...row,
        startAt: new Date(`${row.startAt}Z`),
        endAt: new Date(`${row.endAt}Z`)
      }))
  }

  //= ===================================================================================================
  // JobExecutionProcess TODO: Mover para model
  //= ===================================================================================================

  static async getProcessListByJobExecutionId (executionId) {
    return (await this.db.all(
      SQL`SELECT *
          FROM jobExecutionProcess
          WHERE jobExecutionId = ${executionId};`
    )).map(row => ({
      ...row,
      startAt: new Date(`${row.startAt}Z`),
      endAt: new Date(`${row.endAt}Z`)
    }))
  }

  //= ===================================================================================================
  // JobExecutionProcessLog TODO: Mover para model
  //= ===================================================================================================

  static async getJobExecutionProcessLogByjobProcessId (jobExecutionProcessId) {
    return (await this.db.all(
      SQL`SELECT *
          FROM jobExecutionProcessLog
          WHERE jobExecutionProcessId = ${jobExecutionProcessId}
          ORDER BY id;`
    ))
      .map(row => ({
        ...row,
        datetime: new Date(`${row.datetime}Z`)
      }))
  }

  //= ===================================================================================================
  // ProcessError (TODO: remover)
  //= ===================================================================================================

  /**
   * Retrieves the count of records associated with a specific UUID in the jobError table.
   *
   * @static
   * @async
   * @param {string} uuid - The UUID to fetch records count for.
   * @returns {Promise<number>} - The count of records associated with the provided UUID.
   */
  static async getJobErrorCountByUUID (uuid) {
    const result = await this.db.get(SQL`SELECT COUNT(*) AS count
                                         FROM jobError
                                         WHERE uuid = ${uuid}`)
    return result.count
  }
}

await NfManagerDatabase.initDatabase()
export default NfManagerDatabase
