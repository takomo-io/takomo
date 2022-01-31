import { TkmLogger } from "@takomo/util"

/**
 * @hidden
 */
export const customLogger = (parent: TkmLogger) => {
  const logger = parent.childLogger("aws-sdk")
  return {
    warn: (content: object) => {
      logger?.debug(JSON.stringify(content))
    },
    info: (content: object) => {
      logger?.debug(JSON.stringify(content))
    },
    error: (content: object) => {
      logger?.debug(JSON.stringify(content))
    },
    debug: (content: object) => {
      logger?.debug(JSON.stringify(content))
    },
  }
}
