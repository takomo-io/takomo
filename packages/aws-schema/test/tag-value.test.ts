import {
  expectNoValidationError,
  expectValidationErrors,
} from "@takomo/test-unit"
import { createAwsSchemas } from "../src"

const { tagValue } = createAwsSchemas({ regions: [] })

const valid = ["valid", "valid value", 1, true, false, 0, 2912912, "1212"]

const invalid = [
  ["", '"value" is not allowed to be empty'],
  [
    "x".repeat(256),
    '"value" length must be less than or equal to 255 characters long',
  ],
]

describe("tag value validation", () => {
  test.each(invalid)(
    "fails when '%s' is given",
    expectValidationErrors(tagValue),
  )

  test.each(valid)(
    "succeeds when '%s' is given",
    expectNoValidationError(tagValue),
  )
})
