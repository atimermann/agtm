import type { LoggerInterface } from "./logger.interface.js";
export default class ConsoleLogger implements LoggerInterface {
    info(message: string): void;
    debug(message: string): void;
    warn(message: string): void;
    error(message: string): void;
}
