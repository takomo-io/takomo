import { createOrganizationSchemas } from "../src/"

const { trustedAwsServices } = createOrganizationSchemas({
  regions: [],
  trustedAwsServices: [
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
  ],
})

describe("trusted aws services validation succeeds", () => {
  test("when an empty list of services is given", () => {
    const { error } = trustedAwsServices.validate([])
    expect(error).toBeUndefined()
  })
  test("when a list of single trusted aws service is given", () => {
    const { error } = trustedAwsServices.validate(["ds.amazonaws.com"])
    expect(error).toBeUndefined()
  })
  test("when a list of multiple trusted aws services is given", () => {
    const { error } = trustedAwsServices.validate([
      "sso.amazonaws.com",
      "compute-optimizer.amazonaws.com",
      "ram.amazonaws.com",
    ])
    expect(error).toBeUndefined()
  })
})

describe("trusted aws services validation fails", () => {
  test("when a single string value is given", () => {
    const { error } = trustedAwsServices.validate("ds.amazonaws.com")
    expect(error!.message).toBe('"value" must be an array')
  })
  test("when a single number value is given", () => {
    const { error } = trustedAwsServices.validate(2)
    expect(error!.message).toBe('"value" must be an array')
  })
  test("when a list of single invalid trusted aws service is given", () => {
    const { error } = trustedAwsServices.validate(["nogood"])
    expect(error!.message).toBe(
      '"[0]" must be one of [aws-artifact-account-sync.amazonaws.com, backup.amazonaws.com, cloudtrail.amazonaws.com, compute-optimizer.amazonaws.com, config.amazonaws.com, ds.amazonaws.com, fms.amazonaws.com, license-manager.amazonaws.com, member.org.stacksets.cloudformation.amazonaws.com, ram.amazonaws.com, servicecatalog.amazonaws.com, ssm.amazonaws.com, sso.amazonaws.com, tagpolicies.tag.amazonaws.com]',
    )
  })
  test("when a list of trusted aws services with one invalid is given", () => {
    const { error } = trustedAwsServices.validate([
      "sso.amazonaws.com",
      "xxxxxx",
      "ram.amazonaws.com",
    ])
    expect(error!.message).toBe(
      '"[1]" must be one of [aws-artifact-account-sync.amazonaws.com, backup.amazonaws.com, cloudtrail.amazonaws.com, compute-optimizer.amazonaws.com, config.amazonaws.com, ds.amazonaws.com, fms.amazonaws.com, license-manager.amazonaws.com, member.org.stacksets.cloudformation.amazonaws.com, ram.amazonaws.com, servicecatalog.amazonaws.com, ssm.amazonaws.com, sso.amazonaws.com, tagpolicies.tag.amazonaws.com]',
    )
  })
})
