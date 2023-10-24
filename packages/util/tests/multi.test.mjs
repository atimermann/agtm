import Multi from '../src/multi.mjs' // Ajuste o caminho do import de acordo com sua estrutura de arquivos

class ClassA {
  constructor (x, y, name) {
    this.sum = x + y
  }

  attrA = []
  static staticAttrA = []
  sharedAttribute = 'From ClassA'
  static sharedAttribute = 'From Static ClassA'

  stringAttr = ''

  instanceMethodA () {
    return this.attrA
  }

  static staticMethodA () {
    return this.staticAttrA
  }

  methodToOverride () {
    return 'ClassA'
  }

  static methodToOverride () {
    return 'Static ClassA'
  }

  getStringAttr () {
    return this.stringAttr
  }

  name = 'MyNameA'
}

class ClassB {
  constructor (x, y, name) {
    this.product = x * y
  }

  attrB = []
  static staticAttrB = []
  sharedAttribute = 'From ClassB'
  static sharedAttribute = 'From Static ClassB'

  instanceMethodB () {
    return this.attrB
  }

  static staticMethodB () {
    return this.staticAttrB
  }

  methodToOverride () {
    return 'ClassB'
  }

  static methodToOverride () {
    return 'Static ClassB'
  }

  name = 'MyNameB'
}

class MultiClass extends Multi.inherit(ClassA, ClassB) {
  constructor (x, y, name) {
    super()
    this.product = x * y
    this.name2 = name
  }

  getName () {
    return this.name
  }
}

describe('multi-inheritance tests', () => {
  let instance1
  let instance2

  beforeEach(() => {
    instance1 = new MultiClass()
    instance2 = new MultiClass()

    // Clear arrays directly
    MultiClass.staticAttrA = []
    MultiClass.staticAttrB = []
  })

  test('Instance attributes should not be shared between instances', () => {
    instance1.attrA.push('value1')
    instance1.attrB.push('value1b')

    expect(instance1.attrA).toEqual(['value1'])
    expect(instance1.attrB).toEqual(['value1b'])

    expect(instance2.attrA).toEqual([])
    expect(instance2.attrB).toEqual([])
  })

  test('Static attributes should be shared between instances', () => {
    MultiClass.staticAttrA.push('value2')
    MultiClass.staticAttrB.push('value2b')

    expect(MultiClass.staticAttrA).toEqual(['value2'])
    expect(MultiClass.staticAttrB).toEqual(['value2b'])
  })

  test('Instance methods should work correctly', () => {
    instance1.attrA.push('value3')
    instance1.attrB.push('value3b')

    expect(instance1.instanceMethodA()).toEqual(['value3'])
    expect(instance1.instanceMethodB()).toEqual(['value3b'])
  })

  test('Static methods should work correctly', () => {
    MultiClass.staticAttrA.push('value4')
    MultiClass.staticAttrB.push('value4b')

    expect(MultiClass.staticMethodA()).toEqual(['value4'])
    expect(MultiClass.staticMethodB()).toEqual(['value4b'])
  })

  test('MultiClass should inherit all methods of base classes', () => {
    const multiClassInstance = new MultiClass()
    const classAInstance = new ClassA()
    const classBInstance = new ClassB()

    for (const key of Object.getOwnPropertyNames(Object.getPrototypeOf(classAInstance))) {
      if (key !== 'constructor' && typeof classAInstance[key] === 'function') {
        if (!Object.prototype.hasOwnProperty.call(Object.getPrototypeOf(classBInstance), key)) {
          expect(multiClassInstance[key].toString()).toEqual(classAInstance[key].toString())
        }
      }
    }

    for (const key of Object.getOwnPropertyNames(Object.getPrototypeOf(classBInstance))) {
      if (key !== 'constructor' && typeof classBInstance[key] === 'function') {
        expect(multiClassInstance[key].toString()).toEqual(classBInstance[key].toString())
      }
    }
  })

  test('Method overriding should work correctly', () => {
    const instance = new MultiClass()
    expect(instance.methodToOverride()).toEqual('ClassB')
  })

  test('Method overriding should work correctly', () => {
    expect(MultiClass.methodToOverride()).toEqual('Static ClassB')
  })

  test('Attribute override test', () => {
    const multiClassInstance = new MultiClass()

    expect(multiClassInstance.sharedAttribute).toEqual('From ClassB')
  })

  test('Static attribute override test', () => {
    expect(MultiClass.sharedAttribute).toEqual('From Static ClassB')
  })

  test('MultiClass should correctly call base class constructors', () => {
    const MultiClass = Multi.inherit(ClassA, ClassB)

    const multiClassInstance = new MultiClass(3, 4)

    expect(multiClassInstance.sum).toEqual(7) // From ClassA
    expect(multiClassInstance.product).toEqual(12) // From ClassB
  })

  test('String attribute test', () => {
    const multiClassInstance = new MultiClass(3, 4)

    // Check initial value of name
    expect(multiClassInstance.stringAttr).toEqual('')

    // Change name and verify
    multiClassInstance.stringAttr = 'stringAttr'
    expect(multiClassInstance.stringAttr).toEqual('stringAttr')
  })

  test('Test name attribute', () => {
    const multiClassInstance = new MultiClass(3, 4)

    // Check initial value of name
    expect(multiClassInstance.name).toEqual('MyNameB')
    expect(multiClassInstance.getName()).toEqual('MyNameB')
  })

  test('Test name2 attribute with constructor', () => {
    const multiClassInstance = new MultiClass(3, 4, 'Judite')
    expect(multiClassInstance.name2).toEqual('Judite')
  })

  test('should copy getters and setters', () => {
    // Define the base classes with getters and setters
    class BaseClass1 {
      constructor () {
        this._name1 = ''
      }

      get name1 () {
        return this._name1
      }

      set name1 (value) {
        this._name1 = value
      }
    }

    class BaseClass2 {
      constructor () {
        this._name2 = ''
      }

      get name2 () {
        return this._name2
      }

      set name2 (value) {
        this._name2 = value
      }
    }

    // Create a new class that inherits from BaseClass1 and BaseClass2
    const MultiClass = Multi.inherit(BaseClass1, BaseClass2)

    // Create an instance of MultiClass
    const multiClassInstance = new MultiClass()

    // Set and get the properties using the getters and setters
    multiClassInstance.name1 = 'Name 1'
    multiClassInstance.name2 = 'Name 2'

    // Check if the getters and setters have been correctly copied
    expect(multiClassInstance.name1).toBe('Name 1')
    expect(multiClassInstance.name2).toBe('Name 2')
  })

  // test('MultiClass should inherit all properties of base classes', () => {
  //   const multiClassInstance = new MultiClass()
  //   const classAInstance = new ClassA()
  //   const classBInstance = new ClassB()
  //
  //   for (const key of Object.getOwnPropertyNames(classAInstance)) {
  //     if (Object.prototype.hasOwnProperty.call(classBInstance, key)) {
  //       expect(multiClassInstance[key]).toEqual(classBInstance[key])
  //     } else {
  //       expect(multiClassInstance[key]).toEqual(classAInstance[key])
  //     }
  //   }
  //
  //   for (const key of Object.getOwnPropertyNames(classBInstance)) {
  //     expect(multiClassInstance[key]).toEqual(classBInstance[key])
  //   }
  // })
})
