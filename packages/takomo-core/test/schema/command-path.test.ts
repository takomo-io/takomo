import { commandPath } from "../../src/schema"
import { expectNoValidationError, expectValidationErrors } from "../helpers"

const valid = [
  "/vpc.yml",
  "/network/subnets.yml",
  "/Case/Sensitive/andNumb3rs.yml",
  "/some-more.yml",
  "/vpc",
  "/network/subnets",
  "/Case/Sensitive/andNumb3rs",
  "/some-more",
  "/",
  "/exact-path.yml/eu-west-1",
  "/dev/vpc/subnets.yml/us-east-1",
]

const invalid = [
  ["", '"value" is not allowed to be empty'],
  [
    `/${"x".repeat(128)}`,
    '"value" length must be less than or equal to 128 characters long',
  ],
  [
    "/spaces are not allowed.yml",
    '"value" with value "/spaces are not allowed.yml" fails to match the required pattern: /^\\/$|^(\\/[a-zA-Z][a-zA-Z0-9-]*)+(\\.yml(\\/([a-z0-9-]+))?)?$/',
  ],
  [
    "/invalid-extension.json",
    '"value" with value "/invalid-extension.json" fails to match the required pattern: /^\\/$|^(\\/[a-zA-Z][a-zA-Z0-9-]*)+(\\.yml(\\/([a-z0-9-]+))?)?$/',
  ],
  [
    "/underscores_are_BAD.yml",
    '"value" with value "/underscores_are_BAD.yml" fails to match the required pattern: /^\\/$|^(\\/[a-zA-Z][a-zA-Z0-9-]*)+(\\.yml(\\/([a-z0-9-]+))?)?$/',
  ],
  [
    "/1-begins-with-number.yml",
    '"value" with value "/1-begins-with-number.yml" fails to match the required pattern: /^\\/$|^(\\/[a-zA-Z][a-zA-Z0-9-]*)+(\\.yml(\\/([a-z0-9-]+))?)?$/',
  ],
  [
    "/my/group/stack.yml/moon-north-1",
    '"value" with value "/my/group/stack.yml/moon-north-1" has invalid region "moon-north-1". The region must be one of [us-east-2,us-east-1,us-west-1,us-west-2,ap-east-1,ap-south-1,ap-northeast-3,ap-northeast-2,ap-southeast-1,ap-southeast-2,ap-northeast-1,ca-central-1,cn-north-1,cn-northwest-1,eu-central-1,eu-west-1,eu-west-2,eu-west-3,eu-north-1,me-south-1,sa-east-1,us-gov-east-1]',
  ],
  [
    "/my/group/stack.yml/moon-north-1/",
    '"value" with value "/my/group/stack.yml/moon-north-1/" fails to match the required pattern: /^\\/$|^(\\/[a-zA-Z][a-zA-Z0-9-]*)+(\\.yml(\\/([a-z0-9-]+))?)?$/',
  ],
]

describe("command path validation", () => {
  test.each(invalid)(
    "fails when '%s' is given",
    expectValidationErrors(commandPath),
  )

  test.each(valid)(
    "succeeds when '%s' is given",
    expectNoValidationError(commandPath),
  )
})
