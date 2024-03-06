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
     * @param  {Function}        fn  The function that performs the Prisma query operation. Should be an async function or return a Promise.
     * @return {Promise<object>}     An object indicating the outcome of the operation. On success, it returns the query data.
     *                               On failure, it returns an object with error details, which can be from a Yup validation error
     *                               or a Prisma database error.
     */
    static prismaQuery(fn: Function): Promise<object>;
}
//# sourceMappingURL=service.d.mts.map