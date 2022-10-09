import { createStacksSchemas } from "../../src/takomo-stacks-schema"
import { expectNoValidationError, expectValidationErrors } from "../assertions"

const { stackGroupName } = createStacksSchemas({
  regions: [],
})

const valid = [
  "network",
  "CaseSensitiveandNumb3rs",
  "some-more",
  "ONLYUPPERCASE",
]

const invalid = [
  ["", '"value" is not allowed to be empty'],
  [
    "spaces are not allowed",
    '"value" with value "spaces are not allowed" fails to match the required pattern: /^[a-zA-Z][a-zA-Z0-9-]*$/',
  ],
  [
    "underscores_are_BAD",
    '"value" with value "underscores_are_BAD" fails to match the required pattern: /^[a-zA-Z][a-zA-Z0-9-]*$/',
  ],
  [
    "1-begins-with-number",
    '"value" with value "1-begins-with-number" fails to match the required pattern: /^[a-zA-Z][a-zA-Z0-9-]*$/',
  ],
  [
    "special.characters",
    '"value" with value "special.characters" fails to match the required pattern: /^[a-zA-Z][a-zA-Z0-9-]*$/',
  ],
]

describe("stack group name validation", () => {
  test.each(invalid)(
    "fails when '%s' is given",
    expectValidationErrors(stackGroupName),
  )

  test.each(valid)(
    "succeeds when '%s' is given",
    expectNoValidationError(stackGroupName),
  )
})
