import {
  executeDeployAccountsCommand,
  executeDeployOrganizationCommand,
  executeUndeployAccountsCommand,
} from "@takomo/test-integration"
import {
  ORG_3_ACCOUNT_01_ID,
  ORG_3_ACCOUNT_02_ID,
  ORG_3_ACCOUNT_03_ID,
} from "./env"

const projectDir = "configs/simple"
const configSetResults = [
  {
    configSet: "hello",
    commandPathResults: [
      {
        commandPath: "/",
        stackResults: [
          {
            stackPath: "/example.yml/eu-west-1",
            stackName: "example",
          },
        ],
      },
    ],
  },
]

beforeAll(() =>
  executeDeployOrganizationCommand({ projectDir })
    .expectCommandToSucceed()
    .assert(),
)
describe("concurrent accounts", () => {
  test("Deploy", () =>
    executeDeployAccountsCommand({ projectDir, concurrentAccounts: 4 })
      .expectCommandToSucceed()
      .expectResults({
        organizationalUnitPath: "Root/Test",
        unorderedAccounts: true,
        accountResults: [
          {
            accountId: ORG_3_ACCOUNT_01_ID,
            configSetResults,
          },
          {
            accountId: ORG_3_ACCOUNT_02_ID,
            configSetResults,
          },
          {
            accountId: ORG_3_ACCOUNT_03_ID,
            configSetResults,
          },
        ],
      })
      .assert())
  test("Undeploy", () =>
    executeUndeployAccountsCommand({ projectDir, concurrentAccounts: 2 })
      .expectCommandToSucceed()
      .expectResults({
        organizationalUnitPath: "Root/Test",
        unorderedAccounts: true,
        accountResults: [
          {
            accountId: ORG_3_ACCOUNT_01_ID,
            configSetResults,
          },
          {
            accountId: ORG_3_ACCOUNT_02_ID,
            configSetResults,
          },
          {
            accountId: ORG_3_ACCOUNT_03_ID,
            configSetResults,
          },
        ],
      })
      .assert())
})
