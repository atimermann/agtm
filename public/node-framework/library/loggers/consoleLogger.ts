import type { LoggerInterface } from "./logger.interface.js"

export class ConsoleLogger implements LoggerInterface {
  info(message: string): void {
    console.info(`[INFO]: ${message}`)
  }

  debug(message: string): void {
    console.debug(`[DEBUG]: ${message}`)
  }

  warn(message: string): void {
    console.warn(`[WARN]: ${message}`)
  }

  error(message: string): void {
    console.error(`[ERROR]: ${message}`)
  }
}
