import { createAwsSchemas } from "../../../src/schema/aws-schema"
import {
  expectNoValidationError,
  expectValidationErrors,
} from "../../assertions"

const { accountAlias } = createAwsSchemas({ regions: [] })

const valid = ["myaccount", "12345", "cool-io"]

const invalid = [
  ["", '"value" is not allowed to be empty'],
  [
    "two words",
    '"value" with value "two words" fails to match the required pattern: /^[a-z0-9](([a-z0-9]|-(?!-))*[a-z0-9])?$/',
  ],
  [
    "x".repeat(64),
    '"value" length must be less than or equal to 63 characters long',
  ],
  ["xx", '"value" length must be at least 3 characters long'],
  [
    "MyAccount",
    '"value" with value "MyAccount" fails to match the required pattern: /^[a-z0-9](([a-z0-9]|-(?!-))*[a-z0-9])?$/',
  ],
]

describe("account alias validation", () => {
  test.each(invalid)(
    "fails when '%s' is given",
    expectValidationErrors(accountAlias),
  )

  test.each(valid)(
    "succeeds when '%s' is given",
    expectNoValidationError(accountAlias),
  )
})
