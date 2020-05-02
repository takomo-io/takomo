import { stackPath } from "../../src/schema"
import { expectNoValidationError, expectValidationErrors } from "../helpers"

const valid = [
  "/vpc.yml",
  "/network/subnets.yml",
  "/Case/Sensitive/andNumb3rs.yml",
  "/some-more.yml",
  "/exact-path-abc.yml/eu-west-1",
  "/dev/vpc/vpc.yml/eu-north-1",
]

const invalid = [
  ["", '"value" is not allowed to be empty'],
  [
    "/xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx.yml",
    '"value" length must be less than or equal to 100 characters long',
  ],
  [
    "/spaces are not allowed.yml",
    '"value" with value "/spaces are not allowed.yml" fails to match the required pattern: /^(\\/[a-zA-Z][a-zA-Z0-9-]*)+\\.yml\\/?/',
  ],
  [
    "/invalid-extension.json",
    '"value" with value "/invalid-extension.json" fails to match the required pattern: /^(\\/[a-zA-Z][a-zA-Z0-9-]*)+\\.yml\\/?/',
  ],
  [
    "/underscores_are_BAD.yml",
    '"value" with value "/underscores_are_BAD.yml" fails to match the required pattern: /^(\\/[a-zA-Z][a-zA-Z0-9-]*)+\\.yml\\/?/',
  ],
  [
    "/1-begins-with-number.yml",
    '"value" with value "/1-begins-with-number.yml" fails to match the required pattern: /^(\\/[a-zA-Z][a-zA-Z0-9-]*)+\\.yml\\/?/',
  ],
  [
    "/dev/vpc/vpc.yml/moon-north-1",
    '"value" with value "/dev/vpc/vpc.yml/moon-north-1" has invalid region "moon-north-1". The region must be one of [us-east-2,us-east-1,us-west-1,us-west-2,ap-east-1,ap-south-1,ap-northeast-3,ap-northeast-2,ap-southeast-1,ap-southeast-2,ap-northeast-1,ca-central-1,cn-north-1,cn-northwest-1,eu-central-1,eu-west-1,eu-west-2,eu-west-3,eu-north-1,me-south-1,sa-east-1,us-gov-east-1]',
  ],
]

describe("stack path validation", () => {
  test.each(invalid)(
    "fails when '%s' is given",
    expectValidationErrors(stackPath),
  )

  test.each(valid)(
    "succeeds when '%s' is given",
    expectNoValidationError(stackPath),
  )
})
