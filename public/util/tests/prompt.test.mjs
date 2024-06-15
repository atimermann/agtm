// TODO: Automatizar com stdin ou jest, verificar qual é melhor

import { stdin } from 'mock-stdin'
import { input, checkbox, select } from '../src/prompt/index.mjs'

let io = null

beforeEach(() => {
  io = stdin()
})

afterEach(() => {
  io.restore()
})

describe('input', () => {
  it('should prompt the user and return the user\'s input as a string', async () => {
    const question = 'What is your name?'
    const defaultAnswer = 'John'

    process.nextTick(() => {
      io.send(`${defaultAnswer}\n`)
    })

    const answer = await input(question, defaultAnswer)

    expect(answer).toEqual(defaultAnswer)
  })
})

describe('select', () => {
  it('should prompt the user and return the user\'s selected choice as a string', async () => {
    const question = 'What is your favorite color?'
    const choices = ['Red', 'Green', 'Blue']

    process.nextTick(() => {
      io.send('Red\n') // Assume 'Red' is the selected choice
    })

    const selectedChoice = await select(question, choices)

    expect(selectedChoice).toEqual('Red') // Adjust this as per your function's expected output
  })
})

describe('checkbox', () => {
  it('should prompt the user and return the index of the selected choice', async () => {
    const choices = ['a', 'b', 'c']

    process.nextTick(() => {
      io.send(' ' + '\x1B\x5B\x42' + ' ' + '\n')
    })

    const selectedChoices = await checkbox('Escolha um dos elementos', choices)

    expect(selectedChoices).toEqual(['a', 'b']) // Adjust this as per your function's expected output
  })
})
