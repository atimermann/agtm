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
    constructor(type: string, inner?: object[], message?: string, code?: number | string);
    /**
     * Meta.
     *
     * @type {string}
     */
    meta: string;
    /**
     * Type of error
     *
     * @type {string}
     */
    type: string;
    /**
     * Error code.
     *
     * @type {string|number}
     */
    code: string | number;
    /**
     * Internal errors.
     *
     * @type {any}
     */
    inner: any;
}
//# sourceMappingURL=api-error.d.mts.map