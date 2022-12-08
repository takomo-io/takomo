import { Region } from "../../../src/aws/common/model"
import { createStacksSchemas } from "../../../src/schema/stacks-schema"
import {
  expectNoValidationError,
  expectValidationErrors,
} from "../../assertions"

const regions: ReadonlyArray<Region> = ["eu-west-1", "us-east-1"]

const { stackPath } = createStacksSchemas({
  regions,
})

const valid = [
  "/vpc.yml",
  "/network/subnets.yml",
  "/Case/Sensitive/andNumb3rs.yml",
  "/some-more.yml",
  "/exact-path-abc.yml/eu-west-1",
  "/dev/vpc/vpc.yml/us-east-1",
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
    `"value" with value "/dev/vpc/vpc.yml/moon-north-1" has invalid region "moon-north-1". The region must be one of [${regions.join(
      ", ",
    )}]`,
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
