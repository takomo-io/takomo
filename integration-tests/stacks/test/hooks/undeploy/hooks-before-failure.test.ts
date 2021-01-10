import {
  executeDeployStacksCommand,
  executeUndeployStacksCommand,
} from "@takomo/test-integration"

const projectDir = "configs/hooks",
  commandPath = "/delete/before/failure"

describe("Before hook that fails", () => {
  test("Deploy", () =>
    executeDeployStacksCommand({
      projectDir,
      commandPath,
    })
      .expectCommandToSucceed()
      .expectStackCreateSuccess({
        stackName: "examples-hooks-delete-before-failure-stack-1",
        stackPath: "/delete/before/failure/stack-1.yml/eu-west-1",
      })
      .expectStackCreateSuccess({
        stackName: "examples-hooks-delete-before-failure-stack-2",
        stackPath: "/delete/before/failure/stack-2.yml/eu-west-1",
      })
      .expectStackCreateSuccess({
        stackName: "examples-hooks-delete-before-failure-stack-3",
        stackPath: "/delete/before/failure/stack-3.yml/eu-west-1",
      })
      .assert())

  test("Undeploy", () =>
    executeUndeployStacksCommand({
      projectDir,
      commandPath,
    })
      .expectCommandToFail("Failed")
      .expectStackDeleteSuccess({
        stackName: "examples-hooks-delete-before-failure-stack-3",
        stackPath: "/delete/before/failure/stack-3.yml/eu-west-1",
      })
      .expectFailureStackResult({
        stackName: "examples-hooks-delete-before-failure-stack-2",
        stackPath: "/delete/before/failure/stack-2.yml/eu-west-1",
        message: "Not ok",
      })
      .expectStackResult({
        stackName: "examples-hooks-delete-before-failure-stack-1",
        stackPath: "/delete/before/failure/stack-1.yml/eu-west-1",
        message: "Dependents failed",
        status: "CANCELLED",
        success: false,
      })
      .assert())
})
