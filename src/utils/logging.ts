import { formatTimestamp } from "./date"
import { indentLines } from "./strings"
import { formatYaml } from "./yaml"

/**
 * Logging level.
 */
export type LogLevel = "trace" | "debug" | "info" | "warn" | "error" | "none"

/**
 * Logger.
 */
export interface TkmLogger {
  readonly logLevel: LogLevel

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
  traceText(message: string, text: string | (() => string)): void

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
  debugText(message: string, text: string | (() => string)): void

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
  infoText(message: string, text: string | (() => string)): void

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
  warnText(message: string, text: string | (() => string)): void

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
  childLogger(name: string): TkmLogger
}

const timestamp = (): string => formatTimestamp(new Date())

const defaultFilterFn = (obj: any): any => obj

const getNumericLogLevel = (logLevel: LogLevel): number => {
  switch (logLevel) {
    case "trace":
      return 0
    case "debug":
      return 1
    case "info":
      return 2
    case "warn":
      return 3
    case "error":
      return 4
    case "none":
      return 5
    default:
      throw new Error(`Unknown log level: ${logLevel}`)
  }
}

const formatLogLevel = (logLevel: LogLevel): string => {
  switch (logLevel) {
    case "trace":
      return "[trace]"
    case "debug":
      return "[debug]"
    case "info":
      return "[info ]"
    case "warn":
      return "[warn ]"
    case "error":
      return "[error]"
    default:
      throw new Error(`Unknown log level: ${logLevel}`)
  }
}

export type LogWriter = (
  message?: unknown,
  ...optionalParams: unknown[]
) => void

interface TkmLoggerProps {
  readonly logLevel: LogLevel
  readonly writer: LogWriter
  readonly name?: string
}

export const createLogger = (props: TkmLoggerProps): TkmLogger => {
  const { name, writer, logLevel } = props

  const meta = (level: LogLevel): string =>
    timestamp() + " " + formatLogLevel(level) + (name ? ` - ${name}` : "")

  const logLevelNumber = getNumericLogLevel(logLevel)

  const log = (level: LogLevel, ...message: any[]): void => {
    if (logLevelNumber <= getNumericLogLevel(level)) {
      writer(`${meta(level)} -`, ...message)
    }
  }

  const logObject = (
    level: LogLevel,
    message: string,
    obj: any,
    filterFn: (obj: any) => any,
  ): void => {
    if (logLevelNumber <= getNumericLogLevel(level)) {
      const value = typeof obj === "function" ? obj() : obj
      const filteredObj = filterFn(value)
      writer(
        `${meta(level)} - ${message}\n\n${indentLines(
          formatYaml(filteredObj),
        )}`,
      )
    }
  }

  const logText = (
    level: LogLevel,
    message: string,
    text: string | (() => string),
  ): void => {
    if (logLevelNumber <= getNumericLogLevel(level)) {
      const t = typeof text === "function" ? text() : text
      if (text === "") {
        writer(`${meta(level)} - ${message} <empty>`)
      } else {
        writer(`${meta(level)} - ${message}\n\n${indentLines(t)}`)
      }
    }
  }

  return {
    logLevel,

    trace: (...message: any[]): void => {
      log("trace", ...message)
    },

    traceObject: (
      message: string,
      obj: any,
      filterFn: (obj: any) => any = defaultFilterFn,
    ): void => {
      logObject("trace", message, obj, filterFn)
    },

    traceText: (message: string, text: string | (() => string)): void => {
      logText("trace", message, text)
    },

    debug: (...message: any[]): void => {
      log("debug", ...message)
    },

    debugObject: (
      message: string,
      obj: any,
      filterFn: (obj: any) => any = defaultFilterFn,
    ): void => {
      logObject("debug", message, obj, filterFn)
    },

    debugText: (message: string, text: string | (() => string)): void => {
      logText("debug", message, text)
    },

    info: (...message: any[]): void => {
      log("info", ...message)
    },

    infoText: (message: string, text: string | (() => string)): void => {
      logText("info", message, text)
    },

    infoObject: (
      message: string,
      obj: any,
      filterFn: (obj: any) => any = defaultFilterFn,
    ): void => {
      logObject("info", message, obj, filterFn)
    },

    warn: (...message: any[]): void => {
      log("warn", ...message)
    },

    warnObject: (
      message: string,
      obj: any,
      filterFn: (obj: any) => any = defaultFilterFn,
    ): void => {
      logObject("warn", message, obj, filterFn)
    },

    warnText: (message: string, text: string | (() => string)): void => {
      logText("warn", message, text)
    },

    error: (...message: any[]): void => {
      log("error", ...message)
    },

    childLogger: (childName: string): TkmLogger =>
      createLogger({
        ...props,
        name: name ? `${name} - ${childName}` : childName,
      }),
  }
}

type ConsoleLoggerProps = Omit<TkmLoggerProps, "writer">

export const createConsoleLogger = (props: ConsoleLoggerProps): TkmLogger =>
  createLogger({
    ...props,
    writer: console.log,
  })
