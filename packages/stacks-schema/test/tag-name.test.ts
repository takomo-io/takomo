import {
  expectNoValidationError,
  expectValidationErrors,
} from "@takomo/unit-test"
import { tagName } from "../src"

const valid = ["valid", "valid value"]

const invalid = [
  ["", '"value" is not allowed to be empty'],
  [
    "x".repeat(128),
    '"value" length must be less than or equal to 127 characters long',
  ],
]

describe("tag value validation", () => {
  test.each(invalid)(
    "fails when '%s' is given",
    expectValidationErrors(tagName),
  )

  test.each(valid)(
    "succeeds when '%s' is given",
    expectNoValidationError(tagName),
  )
})
