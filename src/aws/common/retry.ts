import { ConfiguredRetryStrategy } from "@smithy/util-retry"
import {
  RetryErrorInfo,
  RetryStrategyV2,
  StandardRetryToken,
} from "@aws-sdk/types"
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

const isDefaultRetryableErrorType = (
  errorType: RetryErrorInfo["errorType"],
): boolean => errorType === "THROTTLING" || errorType === "TRANSIENT"

class CustomRetryStrategy extends ConfiguredRetryStrategy {
  constructor(private readonly logger: TkmLogger) {
    super(30, (attempts: number) => {
      const expBackoff = Math.pow(2, attempts)
      const maxJitter = Math.ceil(expBackoff * 200)
      const backoff = Math.round(expBackoff + randomInt(0, maxJitter))
      const maxBackoff = randomInt(15000, 20000)
      return Math.min(maxBackoff, backoff)
    })
  }

  override async refreshRetryTokenForRetry(
    tokenToRenew: StandardRetryToken,
    errorInfo: RetryErrorInfo,
  ): Promise<StandardRetryToken> {
    const error = errorInfo.error

    this.logger.trace(`Decide retry strategy for error: ${error}`)

    const defaultRetryDecision = isDefaultRetryableErrorType(
      errorInfo.errorType,
    )
    this.logger.trace(
      `Retry decision from default retry decider: ${defaultRetryDecision}`,
    )

    const additionalRetryableErrorCodesDecision =
      ADDITIONAL_RETRYABLE_ERROR_CODES.includes(error?.name ?? "")
    this.logger.trace(
      `Retry decision from additional error codes: ${additionalRetryableErrorCodesDecision}`,
    )

    const lowLevelDecision = decideByLowLevelError(this.logger, error)
    this.logger.trace(
      `Retry decision from low level error: ${lowLevelDecision}`,
    )

    const retryErrorInfo =
      additionalRetryableErrorCodesDecision || lowLevelDecision
        ? {
            ...errorInfo,
            errorType: "TRANSIENT" as const,
          }
        : errorInfo

    return super.refreshRetryTokenForRetry(tokenToRenew, retryErrorInfo)
  }
}

export const customRetryStrategy = (logger: TkmLogger): RetryStrategyV2 => {
  return new CustomRetryStrategy(logger)
}
