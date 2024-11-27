import type { LoggerInterface } from "./logger.interface"

export default class ConsoleLogger implements LoggerInterface {
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

export interface ILogger {
  info(message: string): void
  debug(message: string): void
  warn(message: string): void
  error(message: string): void
}
