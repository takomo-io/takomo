import { executeDeployStacksCommand } from "@takomo/test-integration/src"

const projectDir = "configs/hook-outputs",
  stackPath = "/stack.yml/eu-north-1",
  stackName = "stack"

describe("Hook outputs", () => {
  test("Large output should work", () =>
    executeDeployStacksCommand({ projectDir })
      .expectCommandToSucceed()
      .expectStackCreateSuccess({
        stackName,
        stackPath,
      })
      .assert())
})
