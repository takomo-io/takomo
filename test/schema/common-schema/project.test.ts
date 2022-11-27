import { createCommonSchema } from "../../../src/schema/common-schema"
import {
  expectNoValidationError,
  expectValidationErrors,
} from "../../assertions"
const { project } = createCommonSchema()

const valid = ["short", "a", "Example", "Cool100", "hyphens-allowed"]

const invalid = [
  ["", '"value" is not allowed to be empty'],
  [
    "x".repeat(61),
    '"value" length must be less than or equal to 60 characters long',
  ],
  [
    "spaces are not allowed",
    '"value" with value "spaces are not allowed" fails to match the required pattern: /^[a-zA-Z]+[a-zA-Z0-9-]*$/',
  ],
  [
    "underscores_are_BAD",
    '"value" with value "underscores_are_BAD" fails to match the required pattern: /^[a-zA-Z]+[a-zA-Z0-9-]*$/',
  ],
  [
    "1-begins-with-number",
    '"value" with value "1-begins-with-number" fails to match the required pattern: /^[a-zA-Z]+[a-zA-Z0-9-]*$/',
  ],
]

describe("project validation", () => {
  test.each(invalid)(
    "fails when '%s' is given",
    expectValidationErrors(project),
  )
  test.each(valid)(
    "succeeds when '%s' is given",
    expectNoValidationError(project),
  )
})
