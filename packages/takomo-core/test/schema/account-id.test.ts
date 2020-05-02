import { accountId } from "../../src/schema"
import { expectNoValidationError, expectValidationErrors } from "../helpers"

const valid = ["123456789012", "012345678901"]

const invalid = [
  ["", '"value" is not allowed to be empty'],
  [
    "1234567890123",
    '"value" with value "1234567890123" fails to match the required pattern: /^\\d{12}$/',
  ],
  [
    "12345678901",
    '"value" with value "12345678901" fails to match the required pattern: /^\\d{12}$/',
  ],
]

describe("account id validation", () => {
  test.each(invalid)(
    "fails when '%s' is given",
    expectValidationErrors(accountId),
  )

  test.each(valid)(
    "succeeds when '%s' is given",
    expectNoValidationError(accountId),
  )

  describe("fails when", () => {
    it("a numeric value is given", () => {
      expectValidationErrors(accountId)(
        123456789012,
        '"value" must be a string',
      )
    })

    it("a boolean value is given", () => {
      expectValidationErrors(accountId)(true, '"value" must be a string')
    })
  })
})
