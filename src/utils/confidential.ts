export const REDACTED_VALUE = "*****"

export const redactConfidentialValue = <T>(
  value: T,
  confidential: boolean,
  confidentialValuesLoggingEnabled: boolean,
): T | typeof REDACTED_VALUE =>
  confidential && !confidentialValuesLoggingEnabled ? REDACTED_VALUE : value
