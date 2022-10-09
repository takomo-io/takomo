import { executeDeployStacksCommand } from "../../../src/commands/stacks"

describe("After hook that fails", () => {
  test("Deploy", () =>
    executeDeployStacksCommand({
      projectDir: `${process.cwd()}/integration-test/configs/hooks`,
      commandPath: "/deploy/after/failure",
    })
      .expectCommandToFail("Failed")
      .expectStackCreateSuccess({
        stackPath: "/deploy/after/failure/stack-1.yml/eu-west-1",
        stackName: "examples-hooks-deploy-after-failure-stack-1",
      })
      .expectFailureStackResult({
        stackPath: "/deploy/after/failure/stack-2.yml/eu-west-1",
        stackName: "examples-hooks-deploy-after-failure-stack-2",
        message: "Not ok",
      })
      .expectStackResult({
        stackPath: "/deploy/after/failure/stack-3.yml/eu-west-1",
        stackName: "examples-hooks-deploy-after-failure-stack-3",
        message: "Dependencies failed",
        success: false,
        status: "CANCELLED",
      })
      .assert())
})
