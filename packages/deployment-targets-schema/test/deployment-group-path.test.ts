import {
  expectNoValidationError,
  expectValidationErrors,
} from "@takomo/test-unit"
import { createDeploymentTargetsSchemas } from "../src"

const { deploymentGroupPath } = createDeploymentTargetsSchemas({
  regions: ["eu-west-1"],
})

const valid = [
  "MyGroup",
  "deployment-group",
  "group1",
  "_groupA",
  "MY_GROUP",
  "x".repeat(250),
  "a/b/c/d/e/f/g/h/i/j",
  "first/second",
]

const invalid = [
  ["", '"value" is not allowed to be empty'],
  [
    "x".repeat(251),
    '"value" length must be less than or equal to 250 characters long',
  ],
  ["a/b/c/d/e/f/g/h/i/j/k", '"value" hierarchy depth must not exceed 10'],
  ["a//b", '"value" must not contain subsequent path separators (/)'],
  [
    "/",
    '"value" with value "/" fails to match the required pattern: /^[_a-zA-Z0-9][a-zA-Z0-9-_/ ]+$/',
  ],
  [
    "/aa",
    '"value" with value "/aa" fails to match the required pattern: /^[_a-zA-Z0-9][a-zA-Z0-9-_/ ]+$/',
  ],
  ["aa/", '"value" must not end with path separator (/)'],
]

describe("deployment group path validation", () => {
  test.each(valid)(
    "succeeds when '%s' is given",
    expectNoValidationError(deploymentGroupPath),
  )
  test.each(invalid)(
    "fails when '%s' is given",
    expectValidationErrors(deploymentGroupPath),
  )
})
