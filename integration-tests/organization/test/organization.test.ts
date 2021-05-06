import { DeployOrganizationOutput } from "@takomo/organization-commands"
import {
  executeBootstrapAccountsCommand,
  executeDeployAccountsCommand,
  executeDeployOrganizationCommand,
  executeTeardownAccountsCommand,
  executeUndeployAccountsCommand,
} from "@takomo/test-integration"
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
  test("undeploy accounts", () =>
    executeUndeployAccountsCommand({
      projectDir,
      var: ["configVersion=v07.yml"],
    })
      .expectCommandToSucceed()
      .expectResults(
        {
          organizationalUnitPath: "Root/sandbox accounts/sandbox-2",
          accountResults: [
            {
              accountId: ORG_A_ACCOUNT_4_ID,
            },
            {
              accountId: ORG_A_ACCOUNT_5_ID,
            },
          ],
        },
        {
          organizationalUnitPath: "Root/test-accounts",
          accountResults: [
            { accountId: ORG_A_ACCOUNT_1_ID },
            { accountId: ORG_A_ACCOUNT_2_ID },
            { accountId: ORG_A_ACCOUNT_3_ID },
          ],
        },
      )
      .assert())

  test("deploy accounts from Root/test-accounts", () =>
    executeDeployAccountsCommand({
      projectDir,
      var: ["configVersion=v07.yml"],
      organizationalUnits: ["Root/test-accounts"],
    })
      .expectCommandToSucceed()
      .expectResults({
        organizationalUnitPath: "Root/test-accounts",
        accountResults: [
          {
            accountId: ORG_A_ACCOUNT_1_ID,
          },
          { accountId: ORG_A_ACCOUNT_2_ID },
          { accountId: ORG_A_ACCOUNT_3_ID },
        ],
      })
      .assert())

  test("deploy single accounts", () =>
    executeDeployAccountsCommand({
      projectDir,
      var: ["configVersion=v07.yml"],
      accountIds: [ORG_A_ACCOUNT_4_ID, ORG_A_ACCOUNT_5_ID],
    })
      .expectCommandToSucceed()
      .expectResults({
        organizationalUnitPath: "Root/sandbox accounts/sandbox-2",
        accountResults: [
          { accountId: ORG_A_ACCOUNT_4_ID },
          { accountId: ORG_A_ACCOUNT_5_ID },
        ],
      })
      .assert())

  test("bootstrap accounts", () =>
    executeBootstrapAccountsCommand({
      projectDir,
      var: ["configVersion=v07.yml"],
    })
      .expectCommandToSucceed()
      .expectResults({
        organizationalUnitPath: "Root/test-accounts",
        accountResults: [
          {
            accountId: ORG_A_ACCOUNT_1_ID,
          },
          {
            accountId: ORG_A_ACCOUNT_2_ID,
          },
          {
            accountId: ORG_A_ACCOUNT_3_ID,
          },
        ],
      })
      .assert())

  test("tear down accounts", () =>
    executeTeardownAccountsCommand({
      projectDir,
      var: ["configVersion=v07.yml"],
    })
      .expectCommandToSucceed()
      .expectResults({
        organizationalUnitPath: "Root/test-accounts",
        accountResults: [
          {
            accountId: ORG_A_ACCOUNT_1_ID,
          },
          {
            accountId: ORG_A_ACCOUNT_2_ID,
          },
          {
            accountId: ORG_A_ACCOUNT_3_ID,
          },
        ],
      })
      .assert())

  test("enable AI services opt-out policies", () => deployOrganization("v09"))

  test("enable backup policies", () => deployOrganization("v10"))
})
