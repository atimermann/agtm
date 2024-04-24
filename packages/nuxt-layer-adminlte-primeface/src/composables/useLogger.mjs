/**
 * @typedef {object} Logger
 *
 * Provides logging methods for various levels of message severity.
 * @property {(message: string) => void} info   - Logs an informational message.
 * @property {(message: string) => void} warn   - Logs a warning message.
 * @property {(message: string) => void} error  - Logs an error message.
 * @property {(message: string) => void} debug  - Logs a debug message.
 */

/**
 * TODO: Utilizar: https://github.com/MarcSchaetz/vuejs3-logger
 * TODO: Parametrizar, ex:  habilitar em produção, entre outros,
 *
 * Composable for logging messages with different severity levels in a development environment.
 * Utilizes different console methods based on the log level and only logs if in development mode.
 *
 * @param  {string}             context  - Context or module name from which the logger is used, to prefix log messages.
 * @return {{ logger: Logger }}          An object containing logging methods for different levels.
 */
export const useLogger = (context) => {
  /**
   * Logs a message at a specified level to the console if in development mode.
   * Utilizes specific console methods based on the log level.
   *
   * @private
   * @param {string} level    - The severity level of the log (INFO, WARN, ERROR, DEBUG).
   * @param {string} method   - The console method to use for logging (log, warn, error, debug).
   * @param {string} message  - The message to be logged.
   */
  const log = (level, method, message) => {
    if (import.meta.dev) {
      console[method](`[${context}]: ${message}`)
    }
  }

  /**
   * Logs an informational message using console.log if in development mode.
   *
   * @param  {string} message  - The informational message to log.
   * @return {void}
   */
  const info = (message) => log('INFO', 'log', message)

  /**
   * Logs a warning message using console.warn if in development mode.
   *
   * @param  {string} message  - The warning message to log.
   * @return {void}
   */
  const warn = (message) => log('WARN', 'warn', message)

  /**
   * Logs an error message using console.error if in development mode.
   *
   * @param  {string} message  - The error message to log.
   * @return {void}
   */
  const error = (message) => log('ERROR', 'error', message)

  /**
   * Logs a debug message using console.debug if in development mode.
   *
   * @param  {string} message  - The debug message to log.
   * @return {void}
   */
  const debug = (message) => log('DEBUG', 'debug', message)

  return {
    info,
    warn,
    error,
    debug
  }
}
