import { executeDeployStacksCommand } from "../src/commands/stacks"

const stackName = "stack",
  stackPath = "/stack.yml/eu-north-1",
  projectDir = `${process.cwd()}/integration-test/configs/helpers-from-custom-dirs`

describe("Helpers from custom dirs", () => {
  test("Deploy", () =>
    executeDeployStacksCommand({ projectDir })
      .expectCommandToSucceed()
      .expectStackCreateSuccess({
        stackName,
        stackPath,
      })
      .expectDeployedCfStackV2({
        stackPath,
        description: "CODE OTHER",
      })
      .assert())
})
