import { executeDeployStacksCommand } from "../src/commands/stacks"

const stackName = "stack1",
  stackPath = "/stack1.yml/eu-north-1",
  projectDir = `${process.cwd()}/integration-test/configs/helpers-from-npm`

describe("Helpers from npm", () => {
  test("Deploy", () =>
    executeDeployStacksCommand({ projectDir })
      .expectCommandToSucceed()
      .expectStackCreateSuccess({
        stackName,
        stackPath,
      })
      .expectDeployedCfStackV2({
        stackPath,
        tags: {
          Tag1: "ONE",
          Tag2: "two",
          Tag3: "THREE",
        },
      })
      .assert())
})
