import {
  executeDeployOrganizationCommand,
  executeListAccountsStacksCommand,
} from "@takomo/test-integration"

const projectDir = "configs/list-accounts-stacks"

beforeAll(() =>
  executeDeployOrganizationCommand({ projectDir })
    .expectCommandToSucceed()
    .assert(),
)

describe("List accounts stacks command", () => {
  it("returns correct output", async () =>
    executeListAccountsStacksCommand({
      projectDir,
      configSetType: "standard",
    })
      .expectCommandToSucceed()
      .assert())
})
