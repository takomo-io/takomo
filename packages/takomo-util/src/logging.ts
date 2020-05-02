import date from "date-and-time"
import { indentLines } from "./strings"
import { formatYaml } from "./yaml"

/**
 * Logging level.
 */
export enum LogLevel {
  TRACE = "trace",
  DEBUG = "debug",
  INFO = "info",
  WARN = "warn",
  ERROR = "error",
}

/**
 * Logger.
 */
export interface Logger {
  /**
   * Log messages using trace level.
   *
   * @param message Messages to log
   */
  trace(...message: any[]): void

  /**
   * Log formatted object using trace level.
   *
   * @param message Message to log
   * @param obj Object to log
   */
  traceObject(message: string, obj: any): void

  /**
   * Log formatted object using trace level.
   *
   * @param message Message to log
   * @param obj Object to log
   * @param filterFn Function to filter the logged object
   */
  traceObject(message: string, obj: any, filterFn: (obj: any) => any): void

  /**
   * Log longer text using trace level.
   *
   * @param message Message to log
   * @param text Text to log
   */
  traceText(message: string, text: string): void

  /**
   * Log messages using debug level.
   *
   * @param message Messages to log
   */
  debug(...message: any[]): void

  /**
   * Log formatted object using debug level.
   *
   * @param message Message to log
   * @param obj Object to log
   */
  debugObject(message: string, obj: any): void

  /**
   * Log formatted object using debug level.
   *
   * @param message Message to log
   * @param obj Object to log
   * @param filterFn Function to filter the logged object
   */
  debugObject(message: string, obj: any, filterFn: (obj: any) => any): void

  /**
   * Log longer text using debug level.
   *
   * @param message Message to log
   * @param text Text to log
   */
  debugText(message: string, text: string): void

  /**
   * Log messages using info level.
   *
   * @param message Messages to log
   */
  info(...message: any[]): void

  /**
   * Log formatted object using info level.
   *
   * @param message Message to log
   * @param obj Object to log
   */
  infoObject(message: string, obj: any): void

  /**
   * Log formatted object using info level.
   *
   * @param message Message to log
   * @param obj Object to log
   * @param filterFn Function to filter the logged object
   */
  infoObject(message: string, obj: any, filterFn: (obj: any) => any): void

  /**
   * Log longer text using info level.
   *
   * @param message Message to log
   * @param text Text to log
   */
  infoText(message: string, text: string): void

  /**
   * Log messages using warn level.
   *
   * @param message Messages to log
   */
  warn(...message: any[]): void

  /**
   * Log formatted object using warn level.
   *
   * @param message Message to log
   * @param obj Object to log
   */
  warnObject(message: string, obj: any): void

  /**
   * Log formatted object using warn level.
   *
   * @param message Message to log
   * @param obj Object to log
   * @param filterFn Function to filter the logged object
   */
  warnObject(message: string, obj: any, filterFn: (obj: any) => any): void

  /**
   * Log longer text using warn level.
   *
   * @param message Message to log
   * @param text Text to log
   */
  warnText(message: string, text: string): void

  /**
   * Log messages using error level.
   *
   * @param message Messages to log
   */
  error(...message: any[]): void

  /**
   * Create a new child logger.
   *
   * @param name Child logger name
   * @returns Child logger
   */
  childLogger(name: string): Logger
}

const timestamp = (): string => date.format(new Date(), "YYYY-MM-DD HH:mm:ss Z")

const defaultFilterFn = (obj: any): any => obj

const getNumericLogLevel = (logLevel: LogLevel): number => {
  switch (logLevel) {
    case LogLevel.TRACE:
      return 0
    case LogLevel.DEBUG:
      return 1
    case LogLevel.INFO:
      return 2
    case LogLevel.WARN:
      return 3
    case LogLevel.ERROR:
      return 4
    default:
      throw new Error(`Unknown log level: ${logLevel}`)
  }
}

const formatLogLevel = (logLevel: LogLevel): string => {
  switch (logLevel) {
    case LogLevel.TRACE:
      return "[trace]"
    case LogLevel.DEBUG:
      return "[debug]"
    case LogLevel.INFO:
      return "[info ]"
    case LogLevel.WARN:
      return "[warn ]"
    case LogLevel.ERROR:
      return "[error]"
    default:
      throw new Error(`Unknown log level: ${logLevel}`)
  }
}

export class ConsoleLogger implements Logger {
  private readonly logLevel: LogLevel
  private readonly logLevelNumber: number
  private readonly name: string | null

  constructor(logLevel: LogLevel = LogLevel.INFO, name: string | null = null) {
    this.logLevel = logLevel
    this.logLevelNumber = getNumericLogLevel(logLevel)
    this.name = name
  }

  private meta(level: LogLevel): string {
    return (
      timestamp() +
      " " +
      formatLogLevel(level) +
      (this.name ? ` - ${this.name}` : "")
    )
  }

  private log(level: LogLevel, ...message: any[]) {
    if (this.logLevelNumber <= getNumericLogLevel(level)) {
      console.log(`${this.meta(level)} -`, ...message)
    }
  }

  private logObject(
    level: LogLevel,
    message: string,
    obj: any,
    filterFn: (obj: any) => any,
  ) {
    if (this.logLevelNumber <= getNumericLogLevel(level)) {
      const filteredObj = filterFn(obj)
      console.log(
        `${this.meta(level)} - ${message}\n\n${indentLines(
          formatYaml(filteredObj),
        )}`,
      )
    }
  }

  private logText(level: LogLevel, message: string, text: string) {
    if (this.logLevelNumber <= getNumericLogLevel(level)) {
      if (text === "") {
        console.log(`${this.meta(level)} - ${message} <empty>`)
      } else {
        console.log(`${this.meta(level)} - ${message}\n\n${indentLines(text)}`)
      }
    }
  }

  trace(...message: any[]): void {
    this.log(LogLevel.TRACE, ...message)
  }

  traceObject(
    message: string,
    obj: any,
    filterFn: (obj: any) => any = defaultFilterFn,
  ): void {
    this.logObject(LogLevel.TRACE, message, obj, filterFn)
  }

  traceText(message: string, text: string): void {
    this.logText(LogLevel.TRACE, message, text)
  }

  debug(...message: any[]): void {
    this.log(LogLevel.DEBUG, ...message)
  }

  debugObject(
    message: string,
    obj: any,
    filterFn: (obj: any) => any = defaultFilterFn,
  ): void {
    this.logObject(LogLevel.DEBUG, message, obj, filterFn)
  }

  debugText(message: string, text: string): void {
    this.logText(LogLevel.DEBUG, message, text)
  }

  info(...message: any[]): void {
    this.log(LogLevel.INFO, ...message)
  }

  infoText(message: string, text: string): void {
    this.logText(LogLevel.INFO, message, text)
  }

  infoObject(
    message: string,
    obj: any,
    filterFn: (obj: any) => any = defaultFilterFn,
  ): void {
    this.logObject(LogLevel.INFO, message, obj, filterFn)
  }

  warn(...message: any[]): void {
    this.log(LogLevel.WARN, ...message)
  }

  warnObject(
    message: string,
    obj: any,
    filterFn: (obj: any) => any = defaultFilterFn,
  ): void {
    this.logObject(LogLevel.WARN, message, obj, filterFn)
  }

  warnText(message: string, text: string): void {
    this.logText(LogLevel.WARN, message, text)
  }

  error(...message: any[]): void {
    this.log(LogLevel.ERROR, ...message)
  }

  childLogger(name: string): Logger {
    const childName = this.name ? `${this.name} - ${name}` : name
    return new ConsoleLogger(this.logLevel, childName)
  }
}
