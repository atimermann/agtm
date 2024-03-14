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
 * Class for validating data using Yup schemas. This base class is intended to be extended with specific validation
 * schemas defined as static attributes. Provides a static method to validate data against these schemas and handle
 * validation errors appropriately.
 *
 */
export default class YupValidation {
  /**
   * Validates data according to the specified Yup schema attribute within the class.
   * Throws an ApiError if validation fails, encapsulating the validation errors.
   *
   * @param  {string}               schemaName  - The attribute name in the class containing the Yup schema.
   * @param  {{[key: string]: any}} data        - The data to be validated.
   *
   * @return {Promise<any>}                     - The validated data if validation succeeds.
   *
   * @throws {ApiError} - An error containing validation details if validation fails.
   */
  static async validate (schemaName, data) {
    logger.debug('Validating Schema...')

    /**
     * @type {YupSchema}  Schema Yup
     */
    // @ts-ignore
    const schema = this[schemaName]
    if (!schema) throw new Error(`Schema "${schemaName}" is not defined in class ${this.name}}`)

    try {
      // Note: Returning directly does not generate an error
      return await schema.validate(data, { abortEarly: false, stripUnknown: false })
    } catch (e) {
      logger.debug('Error by catch...')
      throw new ApiError('YUP_VALIDATION_ERROR', e.inner, e.message, e.code)
    }
  }
}
