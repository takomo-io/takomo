import { executeDeployStacksCommand } from "../src/commands/stacks.js"

const projectDir = `${process.cwd()}/integration-test/configs/hook-outputs`,
  stackPath = "/stack.yml/eu-west-1",
  stackName = "stack"

describe("Hook outputs", () => {
  test("Large output should work", () =>
    executeDeployStacksCommand({ projectDir, logLevel: "error" })
      .expectCommandToSucceed()
      .expectStackCreateSuccess({
        stackName,
        stackPath,
      })
      .assert())
})
