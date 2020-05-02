import { AnySchema } from "@hapi/joi"

type ExpectedValidationErrorAssertion = (
  value: any,
  ...expectedMessages: string[]
) => void

type ExpectedValidationSuccessAssertion = (value: any) => void

export const expectValidationErrors = (
  validator: AnySchema,
): ExpectedValidationErrorAssertion => (
  value: any,
  ...expectedMessages: string[]
) => {
  const {
    error: { details },
  } = validator.validate(value, { abortEarly: false })

  const expected = expectedMessages.slice().sort().join("\n")
  const actual = details
    .map(d => d.message)
    .sort()
    .join("\n")

  expect(actual).toBe(expected)
}

export const expectNoValidationError = (
  validator: AnySchema,
): ExpectedValidationSuccessAssertion => (value: any) => {
  const { error } = validator.validate(value, { abortEarly: false })
  expect(error).toBeUndefined()
}
