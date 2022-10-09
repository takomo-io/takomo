import {
  executeDeployStacksCommand,
  executeUndeployStacksCommand,
} from "../../../src/commands/stacks"

const projectDir = `${process.cwd()}/integration-test/configs/hooks`,
  commandPath = "/delete/before/error"

describe("Before hook that fails on error", () => {
  test("Deploy", () =>
    executeDeployStacksCommand({ projectDir, commandPath })
      .expectCommandToSucceed()
      .expectStackCreateSuccess({
        stackName: "examples-hooks-delete-before-error-stack-1",
        stackPath: "/delete/before/error/stack-1.yml/eu-west-1",
      })
      .expectStackCreateSuccess({
        stackName: "examples-hooks-delete-before-error-stack-2",
        stackPath: "/delete/before/error/stack-2.yml/eu-west-1",
      })
      .expectStackCreateSuccess({
        stackName: "examples-hooks-delete-before-error-stack-3",
        stackPath: "/delete/before/error/stack-3.yml/eu-west-1",
      })
      .assert())

  test("Undeploy", () =>
    executeUndeployStacksCommand({
      projectDir,
      commandPath,
    })
      .expectCommandToFail("Failed")
      .expectStackDeleteSuccess({
        stackName: "examples-hooks-delete-before-error-stack-3",
        stackPath: "/delete/before/error/stack-3.yml/eu-west-1",
      })
      .expectFailureStackResult({
        stackName: "examples-hooks-delete-before-error-stack-2",
        stackPath: "/delete/before/error/stack-2.yml/eu-west-1",
        message: "Oh no!",
      })
      .expectStackResult({
        stackName: "examples-hooks-delete-before-error-stack-1",
        stackPath: "/delete/before/error/stack-1.yml/eu-west-1",
        status: "CANCELLED",
        success: false,
        message: "Dependents failed",
      })
      .assert())
})
