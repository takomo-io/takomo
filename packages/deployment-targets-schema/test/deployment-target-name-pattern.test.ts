import {
  expectNoValidationError,
  expectValidationErrors,
} from "@takomo/test-unit"
import { createDeploymentTargetsSchemas } from "../src"

const { deploymentTargetNamePattern } = createDeploymentTargetsSchemas({
  regions: ["eu-west-1"],
})

const valid = [
  "MyTarget",
  "deployment-target",
  "target1",
  "_targetA",
  "MY_TARGET",
  "x".repeat(60),
  "target1%",
  "%target1",
  "%target1%",
  "%-tst",
  "tst-%",
  "%-tst-%",
]
const invalid = [
  ["", '"value" is not allowed to be empty'],
  [
    "no spaces",
    '"value" with value "no spaces" fails to match the required pattern: /^%?[a-zA-Z0-9-_]+%?$/',
  ],
  [
    "x".repeat(61),
    '"value" length must be less than or equal to 60 characters long',
  ],
]

describe("deployment target name pattern validation", () => {
  test.each(valid)(
    "succeeds when '%s' is given",
    expectNoValidationError(deploymentTargetNamePattern),
  )
  test.each(invalid)(
    "fails when '%s' is given",
    expectValidationErrors(deploymentTargetNamePattern),
  )
})
