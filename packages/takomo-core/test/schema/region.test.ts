import { region } from "../../src/schema"
import { expectNoValidationError, expectValidationErrors } from "../helpers"

const valid = [
  "us-east-2",
  "us-east-1",
  "us-west-1",
  "us-west-2",
  "ap-east-1",
  "ap-south-1",
  "ap-northeast-3",
  "ap-northeast-2",
  "ap-southeast-1",
  "ap-southeast-2",
  "ap-northeast-1",
  "ca-central-1",
  "cn-north-1",
  "cn-northwest-1",
  "eu-central-1",
  "eu-west-1",
  "eu-west-2",
  "eu-west-3",
  "eu-north-1",
  "me-south-1",
  "sa-east-1",
  "us-gov-east-1",
]

const errorMessage =
  '"value" must be one of [us-east-2, us-east-1, us-west-1, us-west-2, ap-east-1, ap-south-1, ap-northeast-3, ap-northeast-2, ap-southeast-1, ap-southeast-2, ap-northeast-1, ca-central-1, cn-north-1, cn-northwest-1, eu-central-1, eu-west-1, eu-west-2, eu-west-3, eu-north-1, me-south-1, sa-east-1, us-gov-east-1]'

const invalid = [
  ["", '"value" is not allowed to be empty', errorMessage],
  ["adsdasd", errorMessage],
]

describe("regions validation", () => {
  test.each(invalid)("fails when '%s' is given", expectValidationErrors(region))
  test.each(valid)(
    "succeeds when '%s' is given",
    expectNoValidationError(region),
  )
})
