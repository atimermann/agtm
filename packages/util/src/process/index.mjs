/**
 * **Created on 02/06/2023**
 *
 * src/child-process/spawn.mjs
 * @author André Timermann <andre@timermann.com.br>
 *
 */
import parseCommand from '../parse-command.mjs'
import { spawn as processSpawn } from 'node:child_process'

/**
 * Executes a given command in a shell and buffers the output. This function makes use of Node.js child_process.spawn method.
 *
 * This function takes a command as a string, parses it, then spawns a child process using the parsed command and arguments.
 * It handles stdout and stderr data events by writing any received data to the corresponding process streams and accumulating
 * them in a string to be returned when the child process ends.
 * Additionally, it handles the child process close event and resolves or rejects the returned promise depending on the exit code.
 * The resolved or rejected value is an object containing the exit code, and the contents of stdout and stderr.
 *
 * A listener for the 'SIGINT' event is also attached to the process, which kills the child process when 'SIGINT' is received.
 * This allows graceful shutdown of the child process when the main process receives an interrupt signal.
 *
 * @example
 *
 * spawn('echo "Hello, World!"')
 *  .then(({ code, stdout, stderr }) => {
 *    console.log(`Child process exited with code ${code}`);
 *    console.log(`stdout: ${stdout}`);
 *    console.log(`stderr: ${stderr}`);
 *  })
 *  .catch(({ code, stdout, stderr }) => {
 *    console.error(`Child process exited with code ${code}`);
 *    console.error(`stdout: ${stdout}`);
 *    console.error(`stderr: ${stderr}`);
 *  });
 *
 * @param {string} commandText - The command to be executed in the shell.
 * @param {object} env - Optional environment key-value pairs to be passed to the child process.
 *
 * @param {boolean} quiet - Does not print to the console
 * @returns {Promise<object>} - A Promise that resolves to an object containing the exit code and the contents of stdout and stderr
 *  of the child process when it finishes successfully, or rejects with the same object when it finishes with an error.
 */
export async function spawn (commandText, env = {}, quiet = false) {
  return new Promise((resolve, reject) => {
    const [command, args] = parseCommand(commandText)
    let stdout = ''
    let stderr = ''

    const pHandler = processSpawn(
      command,
      args,
      { shell: true, env: Object.assign({}, process.env, env) }
    )

    pHandler.stdout.on('data', (data) => {
      stdout += data.toString()
      if (!quiet) process.stdout.write(data.toString())
    })

    pHandler.stderr.on('data', (data) => {
      stderr += data.toString()
      if (!quiet) process.stderr.write(data.toString())
    })

    pHandler.on('error', (error) => {
      // TODO: check stderr += error
      // error.toString()
      if (!quiet) process.stderr.write(JSON.stringify(error, undefined, ' '))
    })

    pHandler.on('close', (code) => {
      if (code === 0) {
        resolve({ code, stdout, stderr })
      } else {
        resolve({ code, stdout, stderr })
        // reject({ code, stdout, stderr })
      }
    })

    process.once('SIGINT', function () {
      if (!quiet) console.log('SPAWN: Caught interrupt signal')
      pHandler.kill('SIGINT')
    })
  })
}
