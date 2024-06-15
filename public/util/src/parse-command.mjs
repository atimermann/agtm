/**
 * **Created on 02/06/2023**
 *
 * /parse-command.mjs
 * @author André Timermann <andre@timermann.com.br>
 *
 */

export default function parseCommand (commandString) {
  const parts = commandString.split(' ')
  const command = parts[0]
  const args = parts.slice(1)
  return [command, args]
}
