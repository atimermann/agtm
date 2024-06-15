/**
 * @file teste example.
 */

/**
 * Example function.
 *
 * @param  {number} a  a
 * @param  {number} b  b
 *
 * @return {number}    return sum
 */
function sum (a, b) {
  return a + b
}

test('adds 1 + 2 to equal 3', () => {
  expect(sum(1, 2)).toBe(3)
})
