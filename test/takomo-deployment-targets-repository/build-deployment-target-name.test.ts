import { Account } from "../../src/aws/organizations/model"
import { buildDeploymentTargetName } from "../../src/takomo-deployment-targets-repository/organization-deployment-target-repository"

const account = (name: string, id: string): Account => ({
  name,
  id,
  email: "",
  arn: "",
  status: "ACTIVE",
})

const cases: Array<[string, string, string]> = [
  ["My account", "123456789012", "my-account-123456789012"],
  ["test", "223344556677", "test-223344556677"],
  ["account-ACCOUNT", "333333333333", "account-account-333333333333"],
]

describe("#buildDeploymentTargetName", () => {
  test.each(cases)(
    "when name '%s' and id '%s' are given returns '%s'",
    (name, id, expected) => {
      expect(buildDeploymentTargetName(account(name, id))).toStrictEqual(
        expected,
      )
    },
  )
})
