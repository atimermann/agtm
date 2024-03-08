/**
 * Created on 06/03/24
 *
 * @file packages/node-framework/library/api/service
 *  Base class to create service with helper methods
 *
 * TODO: Em produção não deve retonar detalhes do erro
 *
 * @author André Timermann <andre@timermann.com.br>
 *
 * @typedef { import("yup").ValidationError } ValidationError
 */

/**
 * @typedef {object} ApiResponse
 * @property {boolean}                  success    Indica se a criação foi bem-sucedida.
 * @property {object|object[]}          [data]     O produto criado ou os detalhes do erro de validação.
 * @property {string}                   [code]     Código do erro
 * @property {string}                   [error]    Tipo de erro ex: VALIDATION_ERROR, DATABASE_ERROR
 * @property {string}                   [message]  descrição do erro
 * @property {object|ValidationError[]} [errors]   Detalhamento do erro
 */

import ApiError from '../api/api-error.mjs'
import createLogger from '../logger.mjs'
const logger = createLogger('Api Service')

/**
 *
 */
export default class ServiceService {
  /**
   * Executes a Prisma database query and handles both validation errors and Prisma errors.
   *
   * This method abstracts the try-catch logic of Prisma query operations, offering consistent error handling
   * and standardized return structures for both successful and failed operations.
   * It is particularly useful for handling Yup validation errors distinctively from database-related errors,
   * enabling callers to easily differentiate and react to these scenarios.
   *
   * @static
   * @async
   * @param  {Function}             fn  The function that performs the Prisma query operation. Should be an async function or return a Promise.
   * @return {Promise<ApiResponse>}     An object indicating the outcome of the operation. On success, it returns the query data.
   *                                    On failure, it returns an object with error details, which can be from a Yup validation error
   *                                    or a Prisma database error.
   */
  static async prismaQuery (fn) {
    try {
      logger.debug('Executing prisma query...')
      return await fn()
    } catch (e) {
      if (e instanceof ApiError) {
        throw e
      } else {
        // Prisma Error
        throw new ApiError('DATABASE_ERROR', e.meta, e.message, e.code)
      }
    }
  }
}
