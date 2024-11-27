import type { LoggerInterface } from "../loggers/logger.interface"

export default class HttpServer {
  private logger: LoggerInterface
  constructor(logger: LoggerInterface) {
    // Injeção de dependência para facilitar o teste
    this.logger = logger
  }

  run() {
    this.logger.info("ok")
  }
}
