import { organizationRoleName } from "../../src/config/schema"
import { expectNoValidationError, expectValidationErrors } from "../helpers"

const valid = ["MyRole", "admin"]

const invalid = [
  ["", '"value" is not allowed to be empty'],
  [
    "two words",
    '"value" with value "two words" fails to match the required pattern: /^[\\w+=/,.@-]+$/',
  ],
  [
    "x".repeat(65),
    '"value" length must be less than or equal to 64 characters long',
  ],
]

describe("organization role name validation", () => {
  test.each(invalid)(
    "fails when '%s' is given",
    expectValidationErrors(organizationRoleName),
  )

  test.each(valid)(
    "succeeds when '%s' is given",
    expectNoValidationError(organizationRoleName),
  )
})
