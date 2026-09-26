import { createAwsSchemas } from "../../../src/schema/aws-schema.js"
import {
  expectNoValidationError,
  expectValidationErrors,
} from "../../assertions.js"

const { deploymentConfig } = createAwsSchemas({ regions: [] })

const valid = [
  {},
  { mode: "STANDARD" },
  { mode: "EXPRESS" },
  { disableRollback: true },
  { disableRollback: false },
  { mode: "EXPRESS", disableRollback: true },
]

const invalid = [
  [{ mode: "FAST" }, '"mode" must be one of [STANDARD, EXPRESS]'],
  [{ mode: "express" }, '"mode" must be one of [STANDARD, EXPRESS]'],
  [
    { mode: 1 },
    '"mode" must be one of [STANDARD, EXPRESS]',
    '"mode" must be a string',
  ],
  [{ disableRollback: "yes" }, '"disableRollback" must be a boolean'],
  [{ other: true }, '"other" is not allowed'],
  ["EXPRESS", '"value" must be of type object'],
]

describe("deployment config validation", () => {
  test.each(invalid)(
    "fails when '%j' is given",
    expectValidationErrors(deploymentConfig),
  )

  test.each(valid)(
    "succeeds when '%j' is given",
    expectNoValidationError(deploymentConfig),
  )
})
