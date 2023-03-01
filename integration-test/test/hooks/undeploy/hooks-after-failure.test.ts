import {
  executeDeployStacksCommand,
  executeUndeployStacksCommand,
} from "../../../src/commands/stacks.js"

const projectDir = `${process.cwd()}/integration-test/configs/hooks`,
  commandPath = "/delete/after/failure"

describe("After hook that fails", () => {
  test("Deploy", () =>
    executeDeployStacksCommand({ projectDir, commandPath })
      .expectCommandToSucceed()
      .expectStackCreateSuccess({
        stackPath: "/delete/after/failure/stack-1.yml/eu-west-1",
        stackName: "examples-hooks-delete-after-failure-stack-1",
      })
      .expectStackCreateSuccess({
        stackPath: "/delete/after/failure/stack-2.yml/eu-west-1",
        stackName: "examples-hooks-delete-after-failure-stack-2",
      })
      .expectStackCreateSuccess({
        stackPath: "/delete/after/failure/stack-3.yml/eu-west-1",
        stackName: "examples-hooks-delete-after-failure-stack-3",
      })
      .assert())

  test("Undeploy", () =>
    executeUndeployStacksCommand({
      projectDir,
      commandPath,
    })
      .expectCommandToFail("Failed")
      .expectStackDeleteSuccess({
        stackPath: "/delete/after/failure/stack-3.yml/eu-west-1",
        stackName: "examples-hooks-delete-after-failure-stack-3",
      })
      .expectFailureStackResult({
        stackPath: "/delete/after/failure/stack-2.yml/eu-west-1",
        stackName: "examples-hooks-delete-after-failure-stack-2",
        message: "Not ok",
      })
      .expectStackResult({
        stackPath: "/delete/after/failure/stack-1.yml/eu-west-1",
        stackName: "examples-hooks-delete-after-failure-stack-1",
        success: false,
        status: "CANCELLED",
        message: "Dependents failed",
      })
      .assert())
})
