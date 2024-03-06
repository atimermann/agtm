/**
 * Class for validating product data using Yup.
 */
export default class YupValidation {
    /**
     * @type {YupSchema}
     */
    static schema: YupSchema;
    /**
     * Validates product data according to the defined schema.
     *
     * @param  {object}       data  Dados do produto para validação.
     * @return {Promise<any>}       O resultado da validação.
     */
    static validate(data: object): Promise<any>;
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