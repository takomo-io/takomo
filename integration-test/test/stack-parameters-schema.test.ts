import { executeDeployStacksCommand } from "../src/commands/stacks"

const projectDir = `${process.cwd()}/integration-test/configs/stack-parameters-schema`

describe("Stack parameters schema", () => {
  test("Validation error from stack schema", () =>
    executeDeployStacksCommand({
      projectDir,
      commandPath: "/a/one.yml",
    })
      .expectCommandToFail("Failed")
      .expectStackCreateFail({
        stackPath: "/a/one.yml/eu-north-1",
        stackName: "a-one",
        errorMessage:
          'Validation errors in stack parameters:\n  - "Environment" is required',
      })
      .assert())

  test("Validation error from stack group schema", () =>
    executeDeployStacksCommand({
      projectDir,
      commandPath: "/b/two.yml",
    })
      .expectCommandToFail("Failed")
      .expectStackCreateFail({
        stackPath: "/b/two.yml/eu-north-1",
        stackName: "b-two",
        errorMessage:
          'Validation errors in stack parameters:\n  - "Environment" is required',
      })
      .assert())

  test("Successful deploy", () =>
    executeDeployStacksCommand({
      projectDir,
      commandPath: "/b/three.yml",
    })
      .expectCommandToSucceed()
      .expectStackCreateSuccess({
        stackName: "b-three",
        stackPath: "/b/three.yml/eu-north-1",
      })
      .assert())
})
