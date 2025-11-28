const LOGGER_PREFIX = '[MastersPromo Plugin]';

export class LoggerUtil {
  static info(message: string, ...args: unknown[]) {
    console.log(`${LOGGER_PREFIX} ${message}`, ...args);
  }
  static error(message: string, ...args: unknown[]) {
    console.error(`${LOGGER_PREFIX} ${message}`, ...args);
  }
  static warn(message: string, ...args: unknown[]) {
    console.warn(`${LOGGER_PREFIX} ${message}`, ...args);
  }
}
