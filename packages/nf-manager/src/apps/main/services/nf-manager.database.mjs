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
export default class NfManagerDatabase {
  static db
  /**
   * Initializes the database by opening a connection to SQLite.
   *
   * @static
   * @async
   * @returns {Promise<void>}
   */
  static async initDatabase () {
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
      startAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
      endAt TIMESTAMP,
      status CHAR(1)  DEFAULT 'E' CHECK( status IN ('S', 'F', 'E') ) NOT NULL
    );

    CREATE TABLE IF NOT EXISTS jobExecutionProcess (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      jobExecutionId INTEGER NOT NULL,
      instance INTEGER NOT NULL,
      pid INTEGER NOT NULL,
      startAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
      endAt TIMESTAMP,
      status CHAR(1) DEFAULT 'E' CHECK( status IN ('S', 'F', 'E') ) NOT NULL,
      FOREIGN KEY (jobExecutionId) REFERENCES jobExecution(id)
    );

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
  // JobExecution (TODO: Criar model)
  //= ===================================================================================================

  /**
   *
   * @param {Worker} worker
   * @returns {Promise<*>}
   */
  static async addJobExecution (worker) {
    const runResult = await this.db.run(
      SQL`INSERT INTO jobExecution (jobUuid, workerName)
      VALUES (${worker.job.uuid}, ${worker.name});`
    )
    return await this.db.get(
      SQL`SELECT * FROM jobExecution WHERE id = ${runResult.lastID};`
    )
  }

  static async getJobExecutionByUUID (uuid) {
    return (await this.db.all(SQL`SELECT *
                                 FROM jobExecution
                                 WHERE jobUuid = ${uuid}
                                 ORDER BY startAt DESC LIMIT 100;`))
      .map(row => ({
        ...row,
        startAt: new Date(row.startAt),
        endAt: new Date(row.endAt)
      }))
  }

  //= ===================================================================================================
  // JobExecutionProcess (TODO: Criar model)
  //= ===================================================================================================

  /**
   *
   * @param newJobExecution
   * @param {JobProcess} process
   * @returns {Promise<*>}
   */
  static async addJobExecutionProcess (newJobExecution, process) {
    const runResult = await this.db.run(
      SQL`INSERT INTO jobExecutionProcess (jobExecutionId, instance, pid)
      VALUES (${newJobExecution.id}, ${process.id}, ${process.childProcess.pid});`
    )

    return await this.db.get(
      SQL`SELECT * FROM jobExecutionProcess WHERE id = ${runResult.lastID};`
    )
  }

  static async getProcessListByJobExecutionId (executionId) {
    return await this.db.all(
      SQL`SELECT * FROM jobExecutionProcess WHERE jobExecutionId = ${executionId};`
    )
  }

  //= ===================================================================================================
  // JobExecutionProcessLog (TODO: Criar model)
  //= ===================================================================================================

  /**
   *
   * @param currentExecution
   * @param {JobProcess} jobProcess
   * @param {string}  data

   * @returns {Promise<*|undefined>}
   */
  static async addJobExecutionProcessLog (currentExecution, jobProcess, data) {
    if (data) {
      try {
        const log = JSON.parse(data)

        const jobExecutionProcess = await this.db.get(
          SQL`SELECT id FROM jobExecutionProcess WHERE jobExecutionId = ${currentExecution.id} AND instance = ${jobProcess.id};`
        )

        if (log.level && log.message) {
          const runResult = await this.db.run(
            SQL`INSERT INTO jobExecutionProcessLog ( jobExecutionProcessId, level, message) VALUES (${jobExecutionProcess.id}, ${log.level}, ${log.message});`

          )

          return await this.db.get(
            SQL`SELECT * FROM jobExecutionProcessLog WHERE id = ${runResult.lastID};`
          )
        }
      } catch (e) {
        if (e.name === 'SyntaxError') {
          return await this.addJobExecutionProcessLog(currentExecution, jobProcess, JSON.stringify({ level: 'error', message: data }))
        } else {
          throw e
        }
      }
    }
  }

  static async getJobExecutionProcessLogByjobProcessId (jobExecutionProcessId) {
    return (await this.db.all(
      SQL`SELECT *
          FROM jobExecutionProcessLog
          WHERE jobExecutionProcessId = ${jobExecutionProcessId}
          ORDER BY id;`
    ))
      .map(row => ({
        ...row,
        datetime: new Date(row.datetime)
      }))
  }

  //= ===================================================================================================
  // ProcessError (TODO: remover)
  //= ===================================================================================================

  /**
   * Adds a process error to the database and returns the data that was just inserted.
   *
   * @static
   * @async
   * @param {JobProcess} jobProcess - The job process containing details about the error.
   * @returns {Promise<object>} - The process error data that was added to the database.
   */
  static async addProcessError (jobProcess) {
    await this.db.run(
      SQL`INSERT INTO jobError (uuid, jobName, worker, jobInstance, errorDescription)
    VALUES (${jobProcess.worker.job.uuid}, ${jobProcess.worker.job.name}, ${jobProcess.worker.name}, ${jobProcess.id}, ${jobProcess.errorsMessage.join('\n')});`
    )

    return await this.db.get(
      SQL`SELECT * FROM jobError WHERE uuid = ${jobProcess.worker.job.uuid} ORDER BY errorTimestamp DESC LIMIT 1;`
    )
  }

  /**
   * Retrieves all records associated with a specific UUID.
   * TODO: Remover, vai pro log
   *
   * @static
   * @async
   * @param {string} uuid - The UUID to fetch records for.
   * @returns {Promise<Array<object>>} - A list of records associated with the provided UUID.
   */
  static async getRecordsByUUID (uuid) {
    return await this.db.all(SQL`SELECT * FROM jobError WHERE uuid = ${uuid}`)
  }

  /**
   * Retrieves the count of records associated with a specific UUID in the jobError table.
   *
   * @static
   * @async
   * @param {string} uuid - The UUID to fetch records count for.
   * @returns {Promise<number>} - The count of records associated with the provided UUID.
   */
  static async getJobErrorCountByUUID (uuid) {
    const result = await this.db.get(SQL`SELECT COUNT(*) AS count FROM jobError WHERE uuid = ${uuid}`)
    return result.count
  }
}
