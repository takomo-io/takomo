import {
  executeDeployStacksCommand,
  executeUndeployStacksCommand,
} from "@takomo/test-integration"

const projectDir = "configs/hooks",
  commandPath = "/delete/after/error"

describe("After hook that fails on error", () => {
  test("Deploy", () =>
    executeDeployStacksCommand({
      projectDir,
      commandPath,
    })
      .expectCommandToSucceed()
      .expectStackCreateSuccess({
        stackName: "examples-hooks-delete-after-error-stack-1",
        stackPath: "/delete/after/error/stack-1.yml/eu-west-1",
      })
      .expectStackCreateSuccess({
        stackName: "examples-hooks-delete-after-error-stack-2",
        stackPath: "/delete/after/error/stack-2.yml/eu-west-1",
      })
      .expectStackCreateSuccess({
        stackName: "examples-hooks-delete-after-error-stack-3",
        stackPath: "/delete/after/error/stack-3.yml/eu-west-1",
      })
      .assert())

  test("Undeploy", () =>
    executeUndeployStacksCommand({ projectDir, commandPath })
      .expectCommandToFail("Failed")
      .expectStackDeleteSuccess({
        stackName: "examples-hooks-delete-after-error-stack-3",
        stackPath: "/delete/after/error/stack-3.yml/eu-west-1",
      })
      .expectFailureStackResult({
        stackName: "examples-hooks-delete-after-error-stack-2",
        stackPath: "/delete/after/error/stack-2.yml/eu-west-1",
        message: "Oh no!",
      })
      .expectStackResult({
        stackName: "examples-hooks-delete-after-error-stack-1",
        stackPath: "/delete/after/error/stack-1.yml/eu-west-1",
        message: "Dependents failed",
        success: false,
        status: "CANCELLED",
      })
      .assert())
})
