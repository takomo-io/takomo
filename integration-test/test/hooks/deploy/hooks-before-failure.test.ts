import { executeDeployStacksCommand } from "../../../src/commands/stacks.js"

describe("Before hook that fails", () => {
  test("Deploy", () =>
    executeDeployStacksCommand({
      projectDir: `${process.cwd()}/integration-test/configs/hooks`,
      commandPath: "/deploy/before/failure",
    })
      .expectCommandToFail("Failed")
      .expectStackCreateSuccess({
        stackName: "examples-hooks-deploy-before-failure-stack-1",
        stackPath: "/deploy/before/failure/stack-1.yml/eu-west-1",
      })
      .expectFailureStackResult({
        stackName: "examples-hooks-deploy-before-failure-stack-2",
        stackPath: "/deploy/before/failure/stack-2.yml/eu-west-1",
        message: "Not ok",
      })
      .expectStackResult({
        stackName: "examples-hooks-deploy-before-failure-stack-3",
        stackPath: "/deploy/before/failure/stack-3.yml/eu-west-1",
        status: "CANCELLED",
        success: false,
        message: "Dependencies failed",
      })
      .assert())
})
