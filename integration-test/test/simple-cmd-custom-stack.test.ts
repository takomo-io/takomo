import {
  executeDeployStacksCommand,
  executeUndeployStacksCommand,
} from "../src/commands/stacks.js"

const stackPath = "/mystack.yml/eu-north-1",
  stackName = "mystack",
  projectDir = `${process.cwd()}/integration-test/configs/simple-cmd-custom-stack`

describe("Simple custom stack", () => {
  test("Deploy", () =>
    executeDeployStacksCommand({
      projectDir,
      var: [
        "currentState=pending",
        "commandState=created",
        "changesState=pending",
      ],
    })
      .expectCommandToSucceed()
      .expectStackCreateSuccess({
        stackPath,
        stackName,
      })
      .assert())

  test("Update", () =>
    executeDeployStacksCommand({
      projectDir,
      var: [
        "currentState=created",
        "commandState=created",
        "changesState=pending",
      ],
    })
      .expectCommandToSucceed()
      .expectStackUpdateSuccess({
        stackPath,
        stackName,
      })
      .assert())

  test("Update with no changes", () =>
    executeDeployStacksCommand({
      projectDir,
      var: [
        "currentState=created",
        "commandState=created",
        "changesState=no-changes",
      ],
    })
      .expectCommandToSucceed()
      .expectStackUpdateSuccessWithNoChanges({
        stackPath,
        stackName,
      })
      .assert())

  test("Undeploy existing stack", () =>
    executeUndeployStacksCommand({
      projectDir,
      var: [
        "currentState=created",
        "commandState=created",
        "changesState=pending",
      ],
    })
      .expectCommandToSucceed()
      .expectStackDeleteSuccess({
        stackPath,
        stackName,
      })
      .assert())

  test("Undeploy not existing stack", () =>
    executeUndeployStacksCommand({
      projectDir,
      var: [
        "currentState=pending",
        "commandState=pending",
        "changesState=pending",
      ],
    })
      .expectCommandToSkip("Skipped")
      .expectSkippedStackResult({
        stackPath,
        stackName,
        message: "Stack not found",
      })
      .assert())

  test("Expect no changes but changes detected", () =>
    executeDeployStacksCommand({
      projectDir,
      expectNoChanges: true,
      var: [
        "currentState=pending",
        "commandState=pending",
        "changesState=pending",
      ],
    })
      .expectCommandToFail("Failed")
      .expectFailureStackResult({
        stackPath,
        stackName,
        message: "Stack has unexpected changes",
        errorMessageToContain: "Stack has unexpected changes",
      })
      .assert())

  test("Expect no changes and no changes detected", () =>
    executeDeployStacksCommand({
      projectDir,
      expectNoChanges: true,
      var: [
        "currentState=created",
        "commandState=created",
        "changesState=no-changes",
      ],
    })
      .expectCommandToSucceed()
      .expectStackUpdateSuccessWithNoChanges({
        stackPath,
        stackName,
      })
      .assert())
})
