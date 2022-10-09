import { executeDeployStacksCommand } from "../../../src/commands/stacks"

describe("After hook that fails on error", () => {
  test("Deploy", () =>
    executeDeployStacksCommand({
      projectDir: `${process.cwd()}/integration-test/configs/hooks`,
      commandPath: "/deploy/after/error",
    })
      .expectCommandToFail("Failed")
      .expectStackCreateSuccess({
        stackName: "examples-hooks-deploy-after-error-stack-1",
        stackPath: "/deploy/after/error/stack-1.yml/eu-west-1",
      })
      .expectFailureStackResult({
        stackName: "examples-hooks-deploy-after-error-stack-2",
        stackPath: "/deploy/after/error/stack-2.yml/eu-west-1",
        message: "Oh no!",
      })
      .expectStackResult({
        stackName: "examples-hooks-deploy-after-error-stack-3",
        stackPath: "/deploy/after/error/stack-3.yml/eu-west-1",
        message: "Dependencies failed",
        success: false,
        status: "CANCELLED",
      })
      .assert())
})
