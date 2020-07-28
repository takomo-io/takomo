import {
  expectNoValidationError,
  expectValidationErrors,
} from "@takomo/unit-test"
import { organizationalUnitName } from "../src"

const valid = [
  "basic",
  "Example",
  "my-group",
  "_with_underscores",
  "Spaces are allowed",
]

const invalid = [
  ["", '"value" is not allowed to be empty'],
  ["subsequent  white", '"value" must not contain subsequent whitespace'],
  [" starts with empty space", '"value" must not start with whitespace'],
  ["ends with empty space ", '"value" must not end with whitespace'],
  [
    "has/separator",
    '"value" with value "has/separator" fails to match the required pattern: /^[a-zA-Z0-9-_ ]+$/',
  ],
  [
    "x".repeat(129),
    '"value" length must be less than or equal to 128 characters long',
  ],
]

describe("organizational unit name validation", () => {
  test.each(invalid)(
    "fails when '%s' is given",
    expectValidationErrors(organizationalUnitName),
  )

  test.each(valid)(
    "succeeds when '%s' is given",
    expectNoValidationError(organizationalUnitName),
  )
})
