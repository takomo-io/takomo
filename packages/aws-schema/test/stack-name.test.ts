import {
  expectNoValidationError,
  expectValidationErrors,
} from "@takomo/test-unit"
import { createAwsSchemas } from "../src"

const { stackName } = createAwsSchemas({ regions: [] })

const valid = ["short", "a", "Example", "Cool100", "hyphens-allowed"]

const invalid = [
  ["", '"value" is not allowed to be empty'],
  [
    "x".repeat(129),
    '"value" length must be less than or equal to 128 characters long',
  ],
  [
    "spaces are not allowed",
    '"value" with value "spaces are not allowed" fails to match the required pattern: /^[a-zA-Z][a-zA-Z0-9-]*$/',
  ],
  [
    "underscores_are_BAD",
    '"value" with value "underscores_are_BAD" fails to match the required pattern: /^[a-zA-Z][a-zA-Z0-9-]*$/',
  ],
  [
    "1-begins-with-number",
    '"value" with value "1-begins-with-number" fails to match the required pattern: /^[a-zA-Z][a-zA-Z0-9-]*$/',
  ],
]

describe("stack name validation", () => {
  test.each(invalid)(
    "fails when '%s' is given",
    expectValidationErrors(stackName),
  )

  test.each(valid)(
    "succeeds when '%s' is given",
    expectNoValidationError(stackName),
  )
})
