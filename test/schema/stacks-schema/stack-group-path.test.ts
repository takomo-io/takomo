import { createStacksSchemas } from "../../../src/schema/stacks-schema"
import {
  expectNoValidationError,
  expectValidationErrors,
} from "../../assertions"

const { stackGroupPath } = createStacksSchemas({ regions: ["eu-west-1"] })

const valid = ["/network", "/", "/Case/Sensitive/andNumb3rs/name", "/some-more"]

const invalid = [
  ["", '"value" is not allowed to be empty'],
  [
    "/xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
    '"value" length must be less than or equal to 100 characters long',
  ],
  [
    "/spaces are not allowed",
    '"value" with value "/spaces are not allowed" fails to match the required pattern: /^\\/$|^(\\/[a-zA-Z][a-zA-Z0-9-]*)+$/',
  ],
  [
    "/underscores_are_BAD",
    '"value" with value "/underscores_are_BAD" fails to match the required pattern: /^\\/$|^(\\/[a-zA-Z][a-zA-Z0-9-]*)+$/',
  ],
  [
    "/1-begins-with-number",
    '"value" with value "/1-begins-with-number" fails to match the required pattern: /^\\/$|^(\\/[a-zA-Z][a-zA-Z0-9-]*)+$/',
  ],
]

describe("stack group path validation", () => {
  test.each(invalid)(
    "fails when '%s' is given",
    expectValidationErrors(stackGroupPath),
  )

  test.each(valid)(
    "succeeds when '%s' is given",
    expectNoValidationError(stackGroupPath),
  )
})
