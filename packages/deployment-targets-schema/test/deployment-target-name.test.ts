import {
  expectNoValidationError,
  expectValidationErrors,
} from "@takomo/test-unit"
import { createDeploymentTargetsSchemas } from "../src"

const { deploymentTargetName } = createDeploymentTargetsSchemas()

const valid = [
  "MyTarget",
  "deployment-target",
  "target1",
  "_targetA",
  "MY_TARGET",
  "x".repeat(60),
]
const invalid = [
  ["", '"value" is not allowed to be empty'],
  [
    "no spaces",
    '"value" with value "no spaces" fails to match the required pattern: /^[a-zA-Z_]+[a-zA-Z0-9-_]*$/',
  ],
  [
    "x".repeat(61),
    '"value" length must be less than or equal to 60 characters long',
  ],
]

describe("deployment target name validation", () => {
  test.each(valid)(
    "succeeds when '%s' is given",
    expectNoValidationError(deploymentTargetName),
  )
  test.each(invalid)(
    "fails when '%s' is given",
    expectValidationErrors(deploymentTargetName),
  )
})
