/**
 * A base class designed to interact with the Prisma ORM, offering capabilities to dynamically
 * enhance derived classes with a proxy for advanced operation interception, including error handling
 * and data transformation. Establishes a framework for consistent model behavior across an application.
 */
export default class PrismaModel {
    /**
     * The validation class containing static methods for data validation.
     * This class should be defined by the user in subclasses.
     *
     * @type {ValidationClass}
     */
    static validation: ValidationClass;
    /**
     * The transformation class containing static methods for data transformation.
     * This class should be defined by the user in subclasses.
     *
     * @type {TransformClass}
     */
    static transform: TransformClass;
    /**
     * Private handler for the proxy, encapsulating error handling and other intercept behaviors.
     *
     * @type {object}
     */
    static "__#11@#handler": object;
    /**
     * Creates a proxy for a given class, applying predefined intercept behavior.
     * This method is intended to enhance classes with additional functionality like automatic error handling.
     *
     * @param  {Function}    targetClass  - The class to be proxied.
     *
     * @return {PrismaModel}              A Proxy instance of the targetClass, with intercepts applied.
     */
    static proxy(targetClass: Function): PrismaModel;
}
/**
 * Created on 13/03/24
 */
export type YupValidation = import('./yup-validation.mjs').default;
/**
 * - Type definition for a class containing data transformation methods.
 */
export type TransformClass = {
    [key: string]: any;
};
/**
 * - Type definition for a class containing data validation methods.
 */
export type ValidationClass = {
    [key: string]: any;
};
//# sourceMappingURL=prisma-model.d.mts.map