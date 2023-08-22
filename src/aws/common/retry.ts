import {
  defaultRetryDecider,
  StandardRetryStrategy,
} from "@aws-sdk/middleware-retry"
import { RetryStrategy } from "@aws-sdk/types"
import { TkmLogger } from "../../utils/logging.js"
import { randomInt } from "../../utils/random.js"

const ADDITIONAL_RETRYABLE_ERROR_CODES = [
  "UnknownEndpoint",
  "NetworkingError",
  "TimeoutError",
]

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

      return defaultRetryDecision || additionalRetryableErrorCodesDecision
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
