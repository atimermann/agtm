export default class LoggerService {
  info(message: string): void {
    console.info(`[INFO]: ${message}`);
  }

  debug(message: string): void {
    console.debug(`[DEBUG]: ${message}`);
  }

  warn(message: string): void {
    console.warn(`[WARN]: ${message}`);
  }

  error(message: string): void {
    console.error(`[ERROR]: ${message}`);
  }
}
