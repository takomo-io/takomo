import { executeDeployStacksCommand } from "@takomo/test-integration"

const projectDir = "configs/hook-outputs",
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
