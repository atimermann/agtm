/**
 * **Created on 02/06/2023**
 *
 * /spawn.test.mjs
 * @author André Timermann <andre@timermann.com.br>
 *
 */
import { spawn } from '../src/process/index.mjs'

describe('spawn', () => {
  test('should execute a command and return correct stdout, stderr and exit code', async (done) => {
    const command = 'echo Hello, World!'
    const expectedOutput = 'Hello, World!\n'

    try {
      const result = await spawn(command)

      expect(result.stdout).toEqual(expectedOutput)
      expect(result.stderr).toEqual('')
      expect(result.code).toEqual(0)
      done()
    } catch (error) {
      // This should not happen for the 'echo' command
      done(`Command execution failed with code ${error.code}: ${error.stderr}`)
    }
  })

  test('should handle command execution errors correctly', async (done) => {
    const command = 'nonexistentcommand'

    try {
      await spawn(command)
      // The command should fail, so if we reach this point, the test should fail.
      done('Command should have failed, but it did not')
    } catch (error) {
      expect(error.code).not.toEqual(0)
      done()
    }
  })
})
