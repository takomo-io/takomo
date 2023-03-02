import { Region } from "../../../src/aws/common/model.js"
import { createStacksSchemas } from "../../../src/schema/stacks-schema.js"
import {
  expectNoValidationError,
  expectValidationErrors,
} from "../../assertions.js"

const regions: ReadonlyArray<Region> = ["eu-west-1", "us-east-1"]

const { blueprintPath } = createStacksSchemas({
  regions,
})

const valid = [
  "vpc.yml",
  "network/subnets.yml",
  "Case/Sensitive/andNumb3rs.yml",
  "some-more.yml",
  "under_score.yml",
  "dev/vpc/vpc.yml",
]

const invalid = [
  ["", '"value" is not allowed to be empty'],
  [
    "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx.yml",
    '"value" length must be less than or equal to 100 characters long',
  ],
  [
    "spaces are not allowed.yml",
    '"value" with value "spaces are not allowed.yml" fails to match the required pattern: /^([a-zA-Z][a-zA-Z0-9-_/]*)+\\.yml/',
  ],
  [
    "invalid-extension.json",
    '"value" with value "invalid-extension.json" fails to match the required pattern: /^([a-zA-Z][a-zA-Z0-9-_/]*)+\\.yml/',
  ],
]

describe("blueprint path validation", () => {
  test.each(invalid)(
    "fails when '%s' is given",
    expectValidationErrors(blueprintPath),
  )

  test.each(valid)(
    "succeeds when '%s' is given",
    expectNoValidationError(blueprintPath),
  )
})
