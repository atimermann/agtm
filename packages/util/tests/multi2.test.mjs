import Multi from '../src/multi.mjs'

class HasAge {
  constructor ({ age }) {
    this._age = age
  }

  set age (age) {
    this._age = age
  }

  get age () {
    return this._age
  }
}

class HasName {
  constructor ({ name }) {
    this.name = name
  }

  getName () {
    return this.name
  }
}

class Person extends Multi.inherit(HasAge, HasName) {
  getNameAndAge () {
    return `${this.name} is ${this.age} years old.`
  }
}

class Element {
  constructor ({ element }) {
    this.element = element
  }

  static elements = ['earth', 'fire', 'water', 'air']
  static isElement (element) {
    return this.elements.includes(element)
  }

  static listElements () {
    return this.elements.join(', ')
  }
}

class FifthElement extends Multi.inherit(Person, Element) {
  static listElements () {
    return `${super.listElements()}, leeloo`
  }
}

describe('multi-inheritance tests', () => {
  let leeloo

  beforeEach(() => {
    leeloo = new FifthElement({
      name: 'Leeloo',
      age: 22,
      element: 'fifth'
    })
  })

  test('Test multi-class inheritance', () => {
    expect((new HasName({ name: 'João' })).getName()).toBe('João')
    // TODO: expect((new Person({ name: 'João' })).getName()).toBe('João')

    // TODO: expect(leeloo.getName()).toBe('Leeloo')
    // TODO: expect(leeloo.age).toBe(22)
    // TODO: expect(leeloo.getNameAndAge()).toBe('Leeloo is 22 years old.')
    expect(leeloo.element).toBe('fifth')

    // getters and setters
    leeloo.age = 23
    expect(leeloo.age).toBe(23)

    // static inheritance
    expect(FifthElement.isElement('air')).toBeTruthy()
    expect(() => {
      leeloo.isElement('air')
    }).toThrow()
    expect(FifthElement.elements).toEqual(['earth', 'fire', 'water', 'air'])
    expect(FifthElement.listElements()).toBe('earth, fire, water, air, leeloo')
  })
})
