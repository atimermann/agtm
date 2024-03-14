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
    static validate(schemaName: string, data: {
        [key: string]: any;
    }): Promise<any>;
}
export type YupSchema = import("yup").AnySchema;
export type ValidationError = import("yup").ValidationError;
export type ValidationResult = {
    /**
     * Indica se os dados são válidos ou não.
     */
    valid: boolean;
    /**
     * Os dados validados. Disponível apenas se `valid` é true.
     */
    validData?: object;
    /**
     * Os erros de validação. Disponível apenas se `valid` é false.
     */
    errors?: ValidationError[];
};
//# sourceMappingURL=yup-validation.d.mts.map