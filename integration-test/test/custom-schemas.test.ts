import { executeDeployStacksCommand } from "../src/commands/stacks"

const projectDir = `${process.cwd()}/integration-test/configs/custom-schemas`

const staticStack = {
  stackPath: "/static.yml/eu-north-1",
  stackName: "static",
}
const staticWithPropsStack = {
  stackPath: "/static-with-props.yml/eu-north-1",
  stackName: "static-with-props",
}

describe("Custom schemas", () => {
  test("Invalid email", () =>
    executeDeployStacksCommand({
      projectDir,
      commandPath: "/static.yml",
      var: ["message1=tralalaa"],
    })
      .expectCommandToFail("Failed")
      .expectStackCreateFail({
        ...staticStack,
        errorMessage:
          "Validation errors in stack parameters:\n" +
          '  - "Message" must be a valid email',
      })
      .assert())

  test("Too long value", () =>
    executeDeployStacksCommand({
      projectDir,
      commandPath: "/static-with-props.yml",
      var: ["message2=this-message-is-too-long-and-not-ok"],
    })
      .expectCommandToFail("Failed")
      .expectStackCreateFail({
        ...staticWithPropsStack,
        errorMessage:
          "Validation errors in stack parameters:\n" +
          '  - "Message" length must be less than or equal to 10 characters long',
      })
      .assert())

  test("Successful deploy", () =>
    executeDeployStacksCommand({
      projectDir,
      var: ["message1=james@example.com", "message2=this-is-ok"],
    })
      .expectCommandToSucceed()
      .expectStackCreateSuccess(staticStack, staticWithPropsStack)
      .assert())
})
