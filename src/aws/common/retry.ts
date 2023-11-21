import {
  defaultRetryDecider,
  StandardRetryStrategy,
} from "@smithy/middleware-retry"
import { RetryStrategy } from "@aws-sdk/types"
import { TkmLogger } from "../../utils/logging.js"
import { randomInt } from "../../utils/random.js"

const ADDITIONAL_RETRYABLE_ERROR_CODES = [
  "UnknownEndpoint",
  "NetworkingError",
  "TimeoutError",
]

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const decideByLowLevelError = (logger: TkmLogger, error: any): boolean => {
  // Fix for random ENOTFOUND errors, see https://github.com/aws/aws-sdk-js-v3/issues/5236
  if (
    (error.code && error.code === "ENOTFOUND") ||
    `${error}`.includes("ENOTFOUND")
  ) {
    logger.warn(`Retry low level nodejs error: ${error}`)
    return true
  }

  return false
}

export const customRetryStrategy = (logger: TkmLogger): RetryStrategy => {
  return new StandardRetryStrategy(async () => 30, {
    retryDecider: (error) => {
      logger.trace(`Decide retry strategy for error: ${error}`)

      const defaultRetryDecision = defaultRetryDecider(error)
      logger.trace(
        `Retry decision from default retry decider: ${defaultRetryDecision}`,
      )

      const additionalRetryableErrorCodesDecision =
        ADDITIONAL_RETRYABLE_ERROR_CODES.includes(error.name)
      logger.trace(
        `Retry decision from additional error codes: ${additionalRetryableErrorCodesDecision}`,
      )

      const lowLevelDecision = decideByLowLevelError(logger, error)
      logger.trace(`Retry decision from low level error: ${lowLevelDecision}`)

      return (
        defaultRetryDecision ||
        additionalRetryableErrorCodesDecision ||
        lowLevelDecision
      )
    },
    delayDecider: (delayBase, attempts) => {
      const expBackoff = Math.pow(2, attempts)
      const maxJitter = Math.ceil(expBackoff * 200)
      const backoff = Math.round(expBackoff + randomInt(0, maxJitter))
      const maxBackoff = randomInt(15000, 20000)
      return Math.min(maxBackoff, backoff)
    },
  })
}
