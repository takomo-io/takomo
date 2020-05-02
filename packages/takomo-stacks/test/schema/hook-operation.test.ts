import { hookOperation } from "../../src/schema"
import { expectNoValidationError, expectValidationErrors } from "../helpers"

const valid = ["create", "delete", "update"]

const invalid = [
  [
    "",
    '"value" is not allowed to be empty',
    '"value" must be one of [create, update, delete]',
  ],
  ["maybe", '"value" must be one of [create, update, delete]'],
]

describe("hook name validation", () => {
  test.each(invalid)(
    "fails when '%s' is given",
    expectValidationErrors(hookOperation),
  )

  test.each(valid)(
    "succeeds when '%s' is given",
    expectNoValidationError(hookOperation),
  )
})
