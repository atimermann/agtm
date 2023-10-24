import parseCommand from '../src/parse-command.mjs'

describe('ParseCommand', () => {
  test('parseCommand should correctly parse command strings', () => {
    const [command1, args1] = parseCommand('ls -la')
    expect(command1).toBe('ls')
    expect(args1).toEqual(['-la'])

    const [command2, args2] = parseCommand('git commit -m "Initial commit"')
    expect(command2).toBe('git')
    expect(args2).toEqual(['commit', '-m', '"Initial', 'commit"'])

    const [command3, args3] = parseCommand('npm install jest')
    expect(command3).toBe('npm')
    expect(args3).toEqual(['install', 'jest'])
  })
})
