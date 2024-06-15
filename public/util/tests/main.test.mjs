import jest from 'jest-mock'
import calculateProgressPercentage from '../src/index.mjs'

function add (a, b) {
  return a + b
}

describe('Main', () => {
  test('add function should correctly add two numbers', () => {
    expect(add(1, 2)).toBe(3)
    expect(add(-1, 2)).toBe(1)
    expect(add(5, 3)).toBe(8)
  })
})

describe('calculateProgressPercentage', () => {
  it('should call the callback with the correct percentage', () => {
    const callback = jest.fn()
    const currentCount = 10
    const items = new Array(100)
    const step = 10

    calculateProgressPercentage(currentCount, items, step, callback)

    expect(callback).toHaveBeenCalledWith(10)
  })

  it('should not call the callback if the condition is not met', () => {
    const callback = jest.fn()
    const currentCount = 5
    const items = new Array(100)
    const step = 10

    calculateProgressPercentage(currentCount, items, step, callback)

    expect(callback).not.toHaveBeenCalled()
  })
})
