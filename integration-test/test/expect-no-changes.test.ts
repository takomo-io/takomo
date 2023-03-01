import { executeDeployStacksCommand } from "../src/commands/stacks.js"

const stack = {
  stackName: "stack",
  stackPath: "/stack.yml/eu-north-1",
}

const projectDir = `${process.cwd()}/integration-test/configs/expect-no-changes`

describe("Expect no changes", () => {
  test("Deploy new stack should fail when no changes are expected", () =>
    executeDeployStacksCommand({
      projectDir,
      expectNoChanges: true,
      var: ["template=v1.yml"],
    })
      .expectCommandToFail("Failed")
      .expectFailureStackResult({
        ...stack,
        message: "Stack has unexpected changes",
        errorMessageToContain: "Stack has unexpected changes",
      })
      .assert())

  test("Deploy new stack", () =>
    executeDeployStacksCommand({
      projectDir,
      expectNoChanges: false,
      var: ["template=v1.yml"],
    })
      .expectCommandToSucceed()
      .expectStackCreateSuccess(stack)
      .assert())

  test("Update should fail when no changes are expected", () =>
    executeDeployStacksCommand({
      projectDir,
      expectNoChanges: true,
      var: ["template=v2.yml"],
    })
      .expectCommandToFail("Failed")
      .expectFailureStackResult({
        ...stack,
        message: "Stack has unexpected changes",
        errorMessageToContain: "Stack has unexpected changes",
      })
      .assert())
})
