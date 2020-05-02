import { iamRoleArn } from "../../src/schema"
import { expectNoValidationError, expectValidationErrors } from "../helpers"

const valid = [
  "arn:aws:iam::123456789012:role/AdminRole-174D5UBFFOHG4",
  "arn:aws:iam::777777777777:role/developer",
  "arn:aws:iam::737373829123:role/readOnly",
]

const invalid = [
  ["", '"value" is not allowed to be empty'],
  [
    "arnaws:iam::777777777777:role/developer",
    '"value" with value "arnaws:iam::777777777777:role/developer" fails to match the required pattern: /^arn:aws:iam::\\d{12}:role\\/.+$/',
  ],
]

describe("command role validation", () => {
  test.each(invalid)(
    "fails when '%s' is given",
    expectValidationErrors(iamRoleArn),
  )

  test.each(valid)(
    "succeeds when '%s' is given",
    expectNoValidationError(iamRoleArn),
  )
})
