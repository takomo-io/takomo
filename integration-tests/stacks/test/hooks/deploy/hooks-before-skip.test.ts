import { executeDeployStacksCommand } from "@takomo/test-integration"

describe("Before hook that skips", () => {
  test("Deploy", () =>
    executeDeployStacksCommand({
      projectDir: "configs/hooks",
      commandPath: "/deploy/before/skip",
    })
      .expectCommandToFail("Failed")
      .expectStackCreateSuccess({
        stackName: "examples-hooks-deploy-before-skip-stack-1",
        stackPath: "/deploy/before/skip/stack-1.yml/eu-west-1",
      })
      .expectSkippedStackResult({
        stackName: "examples-hooks-deploy-before-skip-stack-2",
        stackPath: "/deploy/before/skip/stack-2.yml/eu-west-1",
        message: "Skip requested",
      })
      .expectStackResult({
        stackName: "examples-hooks-deploy-before-skip-stack-3",
        stackPath: "/deploy/before/skip/stack-3.yml/eu-west-1",
        status: "CANCELLED",
        success: false,
        message: "Dependencies skipped",
      })
      .assert())
})
