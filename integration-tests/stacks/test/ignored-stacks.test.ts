import { executeDeployStacksCommand } from "@takomo/test-integration"

describe("Ignored stacks", () => {
  test("Deploy", () =>
    executeDeployStacksCommand({ projectDir: "configs/ignored-stacks" })
      .expectCommandToSucceed()
      .expectStackCreateSuccess({
        stackName: "stack1",
        stackPath: "/stack1.yml/eu-north-1",
      })
      .expectStackCreateSuccess({
        stackName: "b-stack4",
        stackPath: "/b/stack4.yml/eu-north-1",
      })
      .assert())
})
