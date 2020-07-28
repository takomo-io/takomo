import {
  expectNoValidationError,
  expectValidationErrors,
} from "@takomo/unit-test"
import { trustedAwsService } from "../src/"

const valid = [
  "aws-artifact-account-sync.amazonaws.com",
  "backup.amazonaws.com",
  "cloudtrail.amazonaws.com",
  "compute-optimizer.amazonaws.com",
  "config.amazonaws.com",
  "ds.amazonaws.com",
  "fms.amazonaws.com",
  "license-manager.amazonaws.com",
  "member.org.stacksets.cloudformation.amazonaws.com",
  "ram.amazonaws.com",
  "servicecatalog.amazonaws.com",
  "ssm.amazonaws.com",
  "sso.amazonaws.com",
  "tagpolicies.tag.amazonaws.com",
]

const allowedValuesErrorMessage =
  '"value" must be one of [aws-artifact-account-sync.amazonaws.com, backup.amazonaws.com, cloudtrail.amazonaws.com, compute-optimizer.amazonaws.com, config.amazonaws.com, ds.amazonaws.com, fms.amazonaws.com, license-manager.amazonaws.com, member.org.stacksets.cloudformation.amazonaws.com, ram.amazonaws.com, servicecatalog.amazonaws.com, ssm.amazonaws.com, sso.amazonaws.com, tagpolicies.tag.amazonaws.com]'

const invalid = [
  ["", '"value" is not allowed to be empty', allowedValuesErrorMessage],
  ["some.fake.service", allowedValuesErrorMessage],
]

describe("trusted aws services validation", () => {
  test.each(invalid)(
    "fails when '%s' is given",
    expectValidationErrors(trustedAwsService),
  )

  test.each(valid)(
    "succeeds when '%s' is given",
    expectNoValidationError(trustedAwsService),
  )
})
