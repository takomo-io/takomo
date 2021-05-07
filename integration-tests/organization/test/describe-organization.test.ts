import {
  aws,
  executeDescribeOrganizationCommand,
} from "@takomo/test-integration"
import {
  ORG_A_ID,
  ORG_A_MASTER_ACCOUNT_ID,
  ORG_A_MASTER_ACCOUNT_NAME,
} from "./env"

describe("Describe organization command", () => {
  test("returns correct output", async () => {
    const output = await executeDescribeOrganizationCommand({
      projectDir: "configs",
      var: [`configVersion=v01.yml`],
    })
      .expectCommandToSucceed()
      .assert()

    const {
      organization,
      success,
      status,
      message,
      masterAccount,
      enabledPolicies,
    } = output

    expect(success).toBeTruthy()
    expect(status).toBe("SUCCESS")
    expect(message).toBe("Success")

    expect(masterAccount.name).toBe(ORG_A_MASTER_ACCOUNT_NAME)
    expect(masterAccount.status).toBe("ACTIVE")
    expect(masterAccount.id).toBe(ORG_A_MASTER_ACCOUNT_ID)

    expect(organization.featureSet).toBe("ALL")
    expect(organization.masterAccountId).toBe(ORG_A_MASTER_ACCOUNT_ID)
    expect(organization.id).toBe(ORG_A_ID)

    const actualEnabledPolicies = await aws.organizations.getEnabledPolicyTypes()

    expect(enabledPolicies.slice().sort()).toStrictEqual(
      actualEnabledPolicies.slice().sort(),
    )
  })
})
