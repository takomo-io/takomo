import { executeDeployStacksCommand } from "../../../src/commands/stacks"

describe("Before hook that fails on error", () => {
  test("Deploy", () =>
    executeDeployStacksCommand({
      projectDir: `${process.cwd()}/integration-test/configs/hooks`,
      commandPath: "/deploy/before/error",
    })
      .expectCommandToFail("Failed")
      .expectStackCreateSuccess({
        stackPath: "/deploy/before/error/stack-1.yml/eu-west-1",
        stackName: "examples-hooks-deploy-before-error-stack-1",
      })
      .expectFailureStackResult({
        stackPath: "/deploy/before/error/stack-2.yml/eu-west-1",
        stackName: "examples-hooks-deploy-before-error-stack-2",
        message: "Oh no!",
      })
      .expectStackResult({
        stackPath: "/deploy/before/error/stack-3.yml/eu-west-1",
        stackName: "examples-hooks-deploy-before-error-stack-3",
        message: "Dependencies failed",
        success: false,
        status: "CANCELLED",
      })
      .assert())
})
