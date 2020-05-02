import { hookName } from "../../src/schema"
import { expectNoValidationError, expectValidationErrors } from "../helpers"

const valid = ["hook", "Example", "after-all"]

const invalid = [
  ["", '"value" is not allowed to be empty'],
  [
    "two words",
    '"value" with value "two words" fails to match the required pattern: /^[a-zA-Z]+[a-zA-Z0-9-_]*$/',
  ],
  [
    "x".repeat(61),
    '"value" length must be less than or equal to 60 characters long',
  ],
]

describe("hook name validation", () => {
  test.each(invalid)(
    "fails when '%s' is given",
    expectValidationErrors(hookName),
  )

  test.each(valid)(
    "succeeds when '%s' is given",
    expectNoValidationError(hookName),
  )
})
