/**
 * Multi - A class that facilitates the implementation of multiple inheritance in JavaScript.
 * @class
 * @author André Timermann
 * @date 30/07/23
 * @reference https://www.codeproject.com/Articles/1189466/JavaScript-ES-Multiple-Inheritance-Class
 */
export default class Multi {
  /**
   * Method to create a new class that inherits from multiple base classes.
   * @param {...Function} baseClasses - The base classes from which the new class should inherit.
   * @returns {Function} The new class that inherits from all provided base classes.
   * @static
   */
  static inherit (...baseClasses) {
    /**
     * The resulting class that inherits from all provided base classes.
     * @inner
     */
    class classes {
      /**
       * The constructor for the resulting class.
       * @param {...any} argumentsForConstructors - The arguments to pass to the constructors of the base classes.
       */
      constructor (...argumentsForConstructors) {
        for (const BaseClass of baseClasses) {
          const instance = new BaseClass(...argumentsForConstructors)
          Multi._copyProperties(this, instance)
        }
      }
    }

    // Copies properties and methods from the base classes to the resulting class.
    for (const base of baseClasses) {
      Multi._copyProperties(classes, base)
      Multi._copyProperties(classes.prototype, base.prototype)
    }

    return classes
  }

  /**
   * Copies properties from one class to another.
   * @param {Object} targetClass - The class to which the properties should be copied.
   * @param {Object} sourceClass - The class from which the properties should be copied.
   * @private
   * @static
   */
  static _copyProperties (targetClass, sourceClass) {
    for (const key of Reflect.ownKeys(sourceClass)) {
      if (key !== 'constructor' && key !== 'prototype') {
        const desc = Object.getOwnPropertyDescriptor(sourceClass, key)
        Object.defineProperty(targetClass, key, desc)
      }
    }
  }
}
