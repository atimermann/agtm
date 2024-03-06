/**
 * **Created on 06/03/24**
 *
 * @file packages/node-framework/library/api/api-error.mjs
 *  ApiError
 * @author André Timermann <andre@timermann.com.br>
 */

/**
 *
 */
export default class ApiError extends Error {
  /**
   * Creates an instance of ApiError.
   *
   * @param {string}        type     - The type of error.
   * @param {object[]}      [inner]  - The associated internal error, if any.
   * @param {string}        message  - The error message.
   * @param {number|string} [code]   - The error code.
   */
  constructor (type, inner = null, message = 'api error', code = null) {
    super(message)
    this.type = type
    this.inner = inner
    this.code = code

    this.name = this.constructor.name

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor)
    }
  }
}
