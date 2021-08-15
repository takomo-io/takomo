import {
  executeDeployStacksCommand,
  executeUndeployStacksCommand,
} from "@takomo/test-integration"

const projectDir = "configs/hooks",
  commandPath = "/delete/before/skip"

describe("Before hook that skip", () => {
  test("Deploy", () =>
    executeDeployStacksCommand({
      projectDir,
      commandPath,
    })
      .expectCommandToSucceed()
      .expectStackCreateSuccess({
        stackName: "examples-hooks-delete-before-skip-stack-1",
        stackPath: "/delete/before/skip/stack-1.yml/eu-west-1",
      })
      .expectStackCreateSuccess({
        stackName: "examples-hooks-delete-before-skip-stack-2",
        stackPath: "/delete/before/skip/stack-2.yml/eu-west-1",
      })
      .expectStackCreateSuccess({
        stackName: "examples-hooks-delete-before-skip-stack-3",
        stackPath: "/delete/before/skip/stack-3.yml/eu-west-1",
      })
      .assert())

  test("Undeploy", () =>
    executeUndeployStacksCommand({
      projectDir,
      commandPath,
    })
      .expectCommandToFail("Failed")
      .expectStackDeleteSuccess({
        stackName: "examples-hooks-delete-before-skip-stack-3",
        stackPath: "/delete/before/skip/stack-3.yml/eu-west-1",
      })
      .expectSkippedStackResult({
        stackName: "examples-hooks-delete-before-skip-stack-2",
        stackPath: "/delete/before/skip/stack-2.yml/eu-west-1",
        message: "Skip requested",
      })
      .expectStackResult({
        stackName: "examples-hooks-delete-before-skip-stack-1",
        stackPath: "/delete/before/skip/stack-1.yml/eu-west-1",
        message: "Dependents skipped",
        status: "CANCELLED",
        success: false,
      })
      .assert())
})
