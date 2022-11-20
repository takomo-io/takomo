import {
  defaultRetryDecider,
  StandardRetryStrategy,
} from "@aws-sdk/middleware-retry"
import { RetryStrategy } from "@aws-sdk/types"
import { randomInt } from "../../takomo-util"

const ADDITIONAL_RETRYABLE_ERROR_CODES = [
  "UnknownEndpoint",
  "NetworkingError",
  "TimeoutError",
]

export const customRetryStrategy = (): RetryStrategy => {
  return new StandardRetryStrategy(async () => 30, {
    retryDecider: (error) => {
      return (
        defaultRetryDecider(error) ||
        ADDITIONAL_RETRYABLE_ERROR_CODES.includes(error.name)
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
