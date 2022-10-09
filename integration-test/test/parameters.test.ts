import { executeDeployStacksCommand } from "../src/commands/stacks"

describe("Parameters", () => {
  test("Deploy", () =>
    executeDeployStacksCommand({
      projectDir: `${process.cwd()}/integration-test/configs/parameters`,
    })
      .expectCommandToSucceed()
      .expectStackCreateSuccess({
        stackPath: "/vpc.yml/eu-north-1",
        stackName: "examples-parameters-vpc",
      })
      .assert())
})
