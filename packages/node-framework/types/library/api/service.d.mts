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
    static prismaQuery(fn: Function): Promise<ApiResponse>;
}
/**
 * Created on 06/03/24
 */
export type ValidationError = import("yup").ValidationError;
export type ApiResponse = {
    /**
     * Indica se a criação foi bem-sucedida.
     */
    success: boolean;
    /**
     * O produto criado ou os detalhes do erro de validação.
     */
    data?: object | object[];
    /**
     * Código do erro
     */
    code?: string;
    /**
     * Tipo de erro ex: VALIDATION_ERROR, DATABASE_ERROR
     */
    error?: string;
    /**
     * descrição do erro
     */
    message?: string;
    /**
     * Detalhamento do erro
     */
    errors?: object | ValidationError[];
};
//# sourceMappingURL=service.d.mts.map