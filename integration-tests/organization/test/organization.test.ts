import { DeployOrganizationOutput } from "@takomo/organization-commands"
import { executeTeardownAccountsCommand } from "@takomo/test-integration"
import {
  executeBootstrapAccountsCommand,
  executeDeployAccountsCommand,
  executeDeployOrganizationCommand,
  executeUndeployAccountsCommand,
} from "@takomo/test-integration/src"
import {
  ORG_A_ACCOUNT_1_ID,
  ORG_A_ACCOUNT_2_ID,
  ORG_A_ACCOUNT_3_ID,
  ORG_A_ACCOUNT_4_ID,
  ORG_A_ACCOUNT_5_ID,
} from "./env"

const projectDir = "configs"

const deployOrganization = async (
  version: string,
): Promise<DeployOrganizationOutput> =>
  executeDeployOrganizationCommand({
    projectDir,
    var: [`configVersion=${version}.yml`],
  })
    .expectCommandToSucceed()
    .assert()

describe("Organization commands", () => {
  test("initial configuration", () => deployOrganization("v01"))

  test("add new service control policy", () => deployOrganization("v02"))

  test("add new organization units and move some accounts to them", () =>
    deployOrganization("v03"))

  test("add new tag policy", () => deployOrganization("v04"))

  test("disable service control policies", () => deployOrganization("v05"))

  test("disable tag policies", () => deployOrganization("v06"))

  test("enabled tag policies", () => deployOrganization("v07"))

  // Undeploy all accounts
  test("undeploy accounts", async () => {
    const { results } = await executeUndeployAccountsCommand({
      projectDir,
      var: ["configVersion=v07.yml"],
    })
      .expectCommandToSucceed()
      .assert()

    expect(results).toHaveLength(2)

    const [sandbox2Ou, testAccountsOu] = results!

    expect(sandbox2Ou.path).toBe("Root/sandbox accounts/sandbox-2")
    expect(sandbox2Ou.success).toBeTruthy()
    expect(sandbox2Ou.status).toBe("SUCCESS")
    expect(sandbox2Ou.results).toHaveLength(2)

    const [a4, a5] = sandbox2Ou.results

    expect(a4.accountId).toBe(ORG_A_ACCOUNT_4_ID)
    expect(a4.success).toBeTruthy()

    expect(a5.accountId).toBe(ORG_A_ACCOUNT_5_ID)
    expect(a5.success).toBeTruthy()

    expect(testAccountsOu.path).toBe("Root/test-accounts")
    expect(testAccountsOu.success).toBeTruthy()
    expect(testAccountsOu.status).toBe("SUCCESS")
    expect(testAccountsOu.results).toHaveLength(3)

    const [a1, a2, a3] = testAccountsOu.results

    expect(a1.accountId).toBe(ORG_A_ACCOUNT_1_ID)
    expect(a1.success).toBeTruthy()

    expect(a2.accountId).toBe(ORG_A_ACCOUNT_2_ID)
    expect(a2.success).toBeTruthy()

    expect(a3.accountId).toBe(ORG_A_ACCOUNT_3_ID)
    expect(a3.success).toBeTruthy()
  })

  test("deploy accounts from Root/test-accounts", async () => {
    const { results } = await executeDeployAccountsCommand({
      projectDir,
      var: ["configVersion=v07.yml"],
      organizationalUnits: ["Root/test-accounts"],
    })
      .expectCommandToSucceed()
      .assert()

    expect(results).toHaveLength(1)

    const [testAccountsOu] = results!

    expect(testAccountsOu.results).toHaveLength(3)
    const [a1, a2, a3] = testAccountsOu.results

    expect(a1.accountId).toBe(ORG_A_ACCOUNT_1_ID)
    expect(a1.success).toBeTruthy()

    expect(a2.accountId).toBe(ORG_A_ACCOUNT_2_ID)
    expect(a2.success).toBeTruthy()

    expect(a3.accountId).toBe(ORG_A_ACCOUNT_3_ID)
    expect(a3.success).toBeTruthy()
  })

  test("deploy single accounts", async () => {
    const { results } = await executeDeployAccountsCommand({
      projectDir,
      var: ["configVersion=v07.yml"],
      accountIds: [ORG_A_ACCOUNT_4_ID, ORG_A_ACCOUNT_5_ID],
    })
      .expectCommandToSucceed()
      .assert()

    expect(results).toHaveLength(1)

    const [sandbox2Ou] = results!
    expect(sandbox2Ou.results).toHaveLength(2)

    const [a4, a5] = sandbox2Ou.results

    expect(a4.accountId).toBe(ORG_A_ACCOUNT_4_ID)
    expect(a4.success).toBeTruthy()

    expect(a5.accountId).toBe(ORG_A_ACCOUNT_5_ID)
    expect(a5.success).toBeTruthy()
  })

  test("bootstrap accounts", async () => {
    const { results } = await executeBootstrapAccountsCommand({
      projectDir,
      var: ["configVersion=v07.yml"],
    })
      .expectCommandToSucceed()
      .assert()

    expect(results).toHaveLength(1)

    const [testOu] = results!
    expect(testOu.results).toHaveLength(3)

    const [a1, a2, a3] = testOu.results

    expect(a1.accountId).toBe(ORG_A_ACCOUNT_1_ID)
    expect(a1.success).toBeTruthy()

    expect(a2.accountId).toBe(ORG_A_ACCOUNT_2_ID)
    expect(a2.success).toBeTruthy()

    expect(a3.accountId).toBe(ORG_A_ACCOUNT_3_ID)
    expect(a3.success).toBeTruthy()
  })

  test("tear down accounts", async () => {
    const { results } = await executeTeardownAccountsCommand({
      projectDir,
      var: ["configVersion=v07.yml"],
    })
      .expectCommandToSucceed()
      .assert()

    expect(results).toHaveLength(1)

    const [testOu] = results!
    expect(testOu.results).toHaveLength(3)

    const [a1, a2, a3] = testOu.results

    expect(a1.accountId).toBe(ORG_A_ACCOUNT_1_ID)
    expect(a1.success).toBeTruthy()

    expect(a2.accountId).toBe(ORG_A_ACCOUNT_2_ID)
    expect(a2.success).toBeTruthy()

    expect(a3.accountId).toBe(ORG_A_ACCOUNT_3_ID)
    expect(a3.success).toBeTruthy()
  })

  test("enable AI services opt-out policies", () => deployOrganization("v09"))

  test("enable backup policies", () => deployOrganization("v10"))
})
