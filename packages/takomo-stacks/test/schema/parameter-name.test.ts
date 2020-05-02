import { parameterName } from "../../src/schema"
import { expectNoValidationError, expectValidationErrors } from "../helpers"

const valid = ["short", "Example", "Cool100"]

const invalid = [
  ["", '"value" is not allowed to be empty'],
  [
    "x".repeat(256),
    '"value" length must be less than or equal to 255 characters long',
  ],
  [
    "spaces are bad",
    '"value" with value "spaces are bad" fails to match the required pattern: /^[a-zA-Z0-9]+$/',
  ],
  [
    "special_charac-ters",
    '"value" with value "special_charac-ters" fails to match the required pattern: /^[a-zA-Z0-9]+$/',
  ],
]

describe("parameter name validation", () => {
  test.each(invalid)(
    "fails when '%s' is given",
    expectValidationErrors(parameterName),
  )

  test.each(valid)(
    "succeeds when '%s' is given",
    expectNoValidationError(parameterName),
  )
})
