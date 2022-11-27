import { createCommonSchema } from "../../../src/schema/common-schema"
import {
  expectNoValidationError,
  expectValidationErrors,
} from "../../assertions"
const { variableName } = createCommonSchema()

const valid = ["basic", "Example", "my-group", "_with_underscores"]

const invalid = [
  ["", '"value" is not allowed to be empty'],
  [
    "two words",
    '"value" with value "two words" fails to match the required pattern: /^[a-zA-Z_]+[a-zA-Z0-9-_]*$/',
  ],
  [
    "1numberstart",
    '"value" with value "1numberstart" fails to match the required pattern: /^[a-zA-Z_]+[a-zA-Z0-9-_]*$/',
  ],
  [
    "x".repeat(61),
    '"value" length must be less than or equal to 60 characters long',
  ],
]

describe("variable name name validation", () => {
  test.each(invalid)(
    "fails when '%s' is given",
    expectValidationErrors(variableName),
  )

  test.each(valid)(
    "succeeds when '%s' is given",
    expectNoValidationError(variableName),
  )
})
