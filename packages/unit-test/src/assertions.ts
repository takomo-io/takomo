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
  const { error } = validator.validate(value, { abortEarly: false })
  if (error === undefined) {
    fail("Expected an error to be defined")
  }

  const expected = expectedMessages.slice().sort().join("\n")
  const actual = error.details
    .map((d) => d.message)
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
