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
      var: ["currentState=pending", "commandState=created"],
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
      var: ["currentState=created", "commandState=created"],
    })
      .expectCommandToSucceed()
      .expectStackUpdateSuccess({
        stackPath,
        stackName,
      })
      .assert())

  test("Undeploy existing stack", () =>
    executeUndeployStacksCommand({
      projectDir,
      var: ["currentState=created", "commandState=created"],
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
      var: ["currentState=pending", "commandState=pending"],
    })
      .expectCommandToSkip("Skipped")
      .expectSkippedStackResult({
        stackPath,
        stackName,
        message: "Stack not found",
      })
      .assert())
})
