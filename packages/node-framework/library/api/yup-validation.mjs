/**
 * Created on 06/03/24
 *
 * @file packages/node-framework/library/api/yup-validation
 *  Base class to create validation object with YUP
 *
 * @author André Timermann <andre@timermann.com.br>
 *
 * TODO: Criar um gerador de schema automatico apartir do JSON criado no generator do prisma
 */

import createLogger from '../logger.mjs'

/**
 * @typedef { import("yup").AnySchema } YupSchema
 * @typedef { import("yup").ValidationError } ValidationError
 *
 * @typedef {object} ValidationResult
 * @property {boolean}           valid        Indica se os dados são válidos ou não.
 * @property {object}            [validData]  Os dados validados. Disponível apenas se `valid` é true.
 * @property {ValidationError[]} [errors]     Os erros de validação. Disponível apenas se `valid` é false.
 */

import ApiError from './api-error.mjs'
const logger = createLogger('Api Yup Validation')
/**
 * Class for validating product data using Yup.
 */
export default class YupValidation {
  /**
   * @type {YupSchema}
   */
  static schema

  /**
   * Validates product data according to the defined schema.
   *
   * @param  {object}       data  Dados do produto para validação.
   * @return {Promise<any>}       O resultado da validação.
   */
  static async validate (data) {
    logger.debug('Validating Schema...')

    if (!this.schema) {
      throw new Error('Schema not defined')
    }

    let response
    try {
      // Note: Returning directly does not generate an error
      const response = await this.schema.validate(data, { abortEarly: false, stripUnknown: false })

      return response
    } catch (e) {
      logger.debug('Error by catch...')
      throw new ApiError('YUP_VALIDATION_ERROR', e.inner, e.message, e.code)
    }
    // console.log(response)
    // if (!response.valid) {
    //   logger.debug('Error by return...')
    //   throw new ApiError('YUP_VALIDATION_ERROR', response.errors, 'Validation Error')
    // }
    // return response.validData
  }
}
