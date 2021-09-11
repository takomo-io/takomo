import { AccountId } from "@takomo/aws-model"
import {
  executeDeployOrganizationCommand,
  executeListAccountsStacksCommand,
  executeTeardownAccountsCommand,
  executeUndeployAccountsCommand,
  ExpectOrganizationalUnitResultProps,
} from "@takomo/test-integration"
import { ExpectListStackProps } from "@takomo/test-integration/src/commands/organization/list-accounts-stacks"
import {
  ORG_3_ACCOUNT_01_ID,
  ORG_3_ACCOUNT_02_ID,
  ORG_3_ACCOUNT_03_ID,
} from "./env"

const projectDir = "configs/list-accounts-stacks"

type ExpectedOU = ExpectOrganizationalUnitResultProps<ExpectListStackProps>

beforeAll(async () => {
  await executeDeployOrganizationCommand({ projectDir })
    .expectCommandToSucceed()
    .assert()
  await executeUndeployAccountsCommand({ projectDir })
    .expectCommandToSucceed()
    .assert({ skipOutputAssertions: true, skipResultAssertions: true })
  await executeTeardownAccountsCommand({ projectDir })
    .expectCommandToSucceed()
    .assert({ skipOutputAssertions: true, skipResultAssertions: true })
})

const ouOne: ExpectedOU = {
  organizationalUnitPath: "Root/One",
  accountResults: [
    {
      accountId: ORG_3_ACCOUNT_01_ID,
      status: "SUCCESS",
      configSetResults: [
        {
          configSet: "logs",
          commandPathResults: [
            {
              commandPath: "/",
              stackResults: [
                {
                  stackName: "logs-1",
                  stackPath: "/logs-1.yml/eu-west-1",
                },
                {
                  stackName: "logs-2",
                  stackPath: "/logs-2.yml/eu-west-1",
                },
              ],
            },
          ],
        },
      ],
    },
  ],
}

const ouTwo: ExpectedOU = {
  organizationalUnitPath: "Root/Two",
  accountResults: [
    {
      accountId: ORG_3_ACCOUNT_02_ID,
      status: "SUCCESS",
      configSetResults: [
        {
          configSet: "other",
          commandPathResults: [
            {
              commandPath: "/",
              stackResults: [
                {
                  stackName: "another-logs",
                  stackPath: "/another-logs.yml/eu-west-1",
                },
              ],
            },
          ],
        },
        {
          configSet: "logs",
          commandPathResults: [
            {
              commandPath: "/",
              stackResults: [
                {
                  stackName: "logs-1",
                  stackPath: "/logs-1.yml/eu-west-1",
                },
                {
                  stackName: "logs-2",
                  stackPath: "/logs-2.yml/eu-west-1",
                },
              ],
            },
          ],
        },
      ],
    },
    {
      accountId: ORG_3_ACCOUNT_03_ID,
      status: "SUCCESS",
      configSetResults: [
        {
          configSet: "other",
          commandPathResults: [
            {
              commandPath: "/",
              stackResults: [
                {
                  stackName: "another-logs",
                  stackPath: "/another-logs.yml/eu-west-1",
                },
              ],
            },
          ],
        },
        {
          configSet: "logs",
          commandPathResults: [
            {
              commandPath: "/",
              stackResults: [
                {
                  stackName: "logs-1",
                  stackPath: "/logs-1.yml/eu-west-1",
                },
                {
                  stackName: "logs-2",
                  stackPath: "/logs-2.yml/eu-west-1",
                },
              ],
            },
          ],
        },
      ],
    },
  ],
}

const ouWithAccounts = (
  ou: ExpectedOU,
  ...accountIds: ReadonlyArray<AccountId>
): ExpectedOU => ({
  ...ou,
  accountResults: ou.accountResults.filter((a) =>
    accountIds.includes(a.accountId),
  ),
})

describe("List accounts stacks command", () => {
  test("list all with standard config set type", () =>
    executeListAccountsStacksCommand({
      projectDir,
      configSetType: "standard",
    })
      .expectCommandToSucceed()
      .expectResults({
        stageName: "default",
        unorderedAccounts: true,
        organizationalUnitResults: [ouOne, ouTwo],
      })
      .assert())

  test("list by organizational unit with standard config set type", () =>
    executeListAccountsStacksCommand({
      projectDir,
      configSetType: "standard",
      organizationalUnits: ["Root/Two"],
    })
      .expectCommandToSucceed()
      .expectResults({
        stageName: "default",
        unorderedAccounts: true,
        organizationalUnitResults: [ouTwo],
      })
      .assert())

  test("list by accounts with standard config set type", async () =>
    executeListAccountsStacksCommand({
      projectDir,
      configSetType: "standard",
      accountIds: [ORG_3_ACCOUNT_02_ID],
    })
      .expectCommandToSucceed()
      .expectResults({
        stageName: "default",
        unorderedAccounts: true,
        organizationalUnitResults: [ouWithAccounts(ouTwo, ORG_3_ACCOUNT_02_ID)],
      })
      .assert())
})
