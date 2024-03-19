/**
 * Created on 13/03/24
 *
 * @file
 * This file implements the core functionality for the Model class, providing mechanisms for
 * automatic validation, transformation, and error handling of data. It serves as a foundational layer
 * for building model classes that interact with databases through the Prisma ORM, enhancing them with
 * additional behaviors such as data validation and transformation, both before saving to and after retrieving
 * data from the database, as well as sophisticated error handling that integrates with an application's
 * error management strategy.
 *
 * Model  Quick Guide
 * **********************************
 *
 * 1) Proxy Basics:
 *    - Essential knowledge for this module. A Proxy intercepts operations on its target object, enabling behavior
 *    customization.
 *
 * 2) Using Model:
 *    - Interact with Model via a proxy, not directly. Use Model.proxy(MyClass) to enhance your class with
 *    advanced features.
 *
 * 3) ProxyHandler Functionality:
 *    - Intercepts method calls, acting similarly to method decorators, and embeds additional processing logic.
 *
 * 4) Method Enhancements:
 *    - Validation: Carrega a classe de validação especificado em validation, procura pelo metodo com mesmo nome do
 *          método chamado na classe original
 *    - SET Transformation: Carrega a classe de transformação especificado em transform, procura pelo metodo com mesmo
 *          nome sufixado com **Set***
 *    - Method Execution: Runs the intended method.
 *    - GET Transformation:  Loads the transformation class specified in transform, searches for the method with the
 *          same name suffixed with **Get***
 *    - Returns: Final data is provided back to the user.
 *
 * The framework utilizes JavaScript Proxies to augment Model classes with automatic validation, data
 *  transformation, and error handling, simplifying data management tasks.
 *
 * TOOD: Teste Unitário urgente
 * @author André Timermann <andre@timermann.com.br>
 *
 * @typedef {import('./yup-validation.mjs').default} YupValidation
 * @typedef {{[key: string]: any}} TransformClass - Type definition for a class containing data transformation methods.
 * @typedef {{[key: string]: any}} ValidationClass - Type definition for a class containing data validation methods.
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
import { isFunction } from 'lodash-es'
import createLogger from '../logger.mjs'

const logger = createLogger('Model')

const GET = 'Get'
const SET = 'Set'

/**
 * Validates input data using a specified validation class and function.
 * Intended for pre-processing data before main logic execution.
 *
 * @param  {any}             data             - Data to validate.
 * @param  {ValidationClass} ValidationClass  - The class containing validation methods.
 * @param  {string}          fnName           - The name of the validation function to use.
 * @return {Promise<any>}                     - The validated data, potentially modified or as is if validation passes.
 */
async function validate (data, ValidationClass, fnName) {
  if (!ValidationClass) return data
  logger.debug('ValidateClass found!')
  const validationFunction = ValidationClass[fnName]
  if (!validationFunction) return data
  logger.debug(`Validation function "${fnName}" found"!"`)
  if (!isFunction(validationFunction)) throw new TypeError(`${fnName} must be function in validation class`)
  return await validationFunction.call(ValidationClass, data)
}

/**
 * Asynchronously transforms data using the specified transformation function.
 * The transformation can be applied to either a single item or an array of items.
 * It supports both 'Get' and 'Set' transformations based on the type parameter.
 *
 * @param  {'Get' | 'Set'}        type            - Specifies the type of transformation, either 'Get' for post-retrieval or 'Set' for pre-save transformations.
 * @param  {any | any[]}          data            - The data to be transformed. Can be a single item or an array of items.
 * @param  {TransformClass}       TransformClass  - The class containing the transformation methods.
 * @param  {string}               fnName          - The name of the original function being called, used to derive the transformation method name.
 *
 * @return {Promise<any | any[]>}                 - The transformed data, which can be either a single item or an array of items, depending on the input.
 */
async function transform (type, data, TransformClass, fnName) {
  if (data === undefined || data === null) return
  if (!TransformClass) return data
  logger.debug('TransformClass found!')
  const transformGetFunctionName = `${fnName}${type}`
  const transformGetFunction = TransformClass[transformGetFunctionName]
  if (!transformGetFunction) return data
  logger.debug(`Transoform function "${fnName}" found!`)

  if (!isFunction(transformGetFunction)) throw new TypeError(`${transformGetFunctionName} must be function`)
  logger.debug(`Executing GET transform Class: ${transformGetFunctionName}`)
  if (Array.isArray(data)) {
    return Promise.all(data.map(async item => {
      return await transformGetFunction.call(TransformClass, item)
    }))
  } else {
    return await transformGetFunction.call(TransformClass, data)
  }
}

/**
 * Wraps a target function with additional pre-processing (validation, 'Set' transformation) and post-processing ('Get' transformation)
 * operations. Also, it handles errors thrown by the target function, specifically catching instances of ApiError and re-throwing them
 * after potentially transforming other types of errors into ApiError.
 *
 * @param  {string}               fnName    - The name of the function being wrapped. This is used for logging and to identify transformation functions.
 * @param  {Function}             fn        - The original target function to be wrapped.
 * @param  {{[key: string]: any}} target    - The target object on which the original function is a method.
 * @param  {{[key: string]: any}} receiver  - The Proxy object, used create context on the original object
 * @return {Function}                       - A new async function that wraps the original function with additional behavior.
 */
function wrapAsyncFunction (fnName, fn, target, receiver) {
  const TransformClass = target.transform
  const ValidationClass = target.validation

  return async (/** @type {any|any[]} */ requestData) => {
    try {
      // 01. Validate
      logger.debug(`01. Validate "${fnName}"...`)
      const validatedData = await validate(requestData, ValidationClass, fnName)
      // 02. Transform SET
      logger.debug(`02. Transform Set "${fnName}"...`)
      const transformedData = await transform(SET, validatedData, TransformClass, fnName)
      // 03. Execute
      logger.debug(`03. Execute "${fnName}"...`)
      // Here we need to pass the receive as a context, which is nothing more than the proxy, so calls in the class itself also call the proxy
      const response = await fn.call(receiver, transformedData)
      // 04. Transform GET
      logger.debug(`03. Transform Get "${fnName}"...`)
      return await transform(GET, response, TransformClass, fnName)
    } catch (e) {
      if (e instanceof ApiError) {
        throw e
      } else {
        // Assume any other error as a database related error for this context
        console.error(e)
        throw new ApiError('DATABASE_ERROR', e.meta, e.message, e.code)
      }
    }
  }
}

/**
 * Handler for proxy operations, focusing on method invocation.
 * Intercepts function calls to perform error handling and applies specific logic for ApiError.
 */
const proxyHandler = {
  /**
   * Intercepts property access on the target object.
   * If the property is a function, wraps it in an async function to catch and handle errors.
   *
   * @param  {{[key: string]: any}} target    - The original object the proxy is for.
   * @param  {string}               prop      - The name of the property being accessed.
   * @param  {{[key: string]: any}} receiver  - The Proxy object, used create context on the original object
   *
   * @return {Function|*}                     - If the property is a function, returns a wrapped async function. Otherwise, returns the property value directly.
   */
  get (target, prop, receiver) {
    const targetProp = target[prop]

    if (typeof targetProp === 'function') {
      const isPrivateMethod = prop.startsWith('$')
      if (isPrivateMethod) {
        return targetProp
      }

      return wrapAsyncFunction(prop, targetProp, target, receiver)
    }

    return targetProp
  }
}

/**
 * A base class designed to interact with the Prisma ORM, offering capabilities to dynamically
 * enhance derived classes with a proxy for advanced operation interception, including error handling
 * and data transformation. Establishes a framework for consistent model behavior across an application.
 */
export default class Model {
  /**
   * The validation class containing static methods for data validation.
   * This class should be defined by the user in subclasses.
   *
   * @type {ValidationClass}
   */
  static validation

  /**
   * The transformation class containing static methods for data transformation.
   * This class should be defined by the user in subclasses.
   *
   * @type {TransformClass}
   */
  static transform

  /**
   * Private handler for the proxy, encapsulating error handling and other intercept behaviors.
   *
   * @type {object}
   */
  static #handler = proxyHandler

  /**
   * Creates a proxy for a given class, applying predefined intercept behavior.
   * This method is intended to enhance classes with additional functionality like automatic error handling.
   *
   * @template {object} T
   * @param  {T} targetClass  - The class to be proxied.
   * @return {T}              - A Proxy instance of the targetClass, with intercepts applied.
   */
  static proxy (targetClass) {
    return new Proxy(targetClass, this.#handler)
  }
}
