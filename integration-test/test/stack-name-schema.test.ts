import { executeDeployStacksCommand } from "../src/commands/stacks.js"

const projectDir = `${process.cwd()}/integration-test/configs/stack-name-schema`

describe("Stack name schema", () => {
  test("Validation error from stack schema", () =>
    executeDeployStacksCommand({
      projectDir,
      commandPath: "/a/one.yml",
    }).expectCommandToThrow(
      "Validation errors in name of stack /a/one.yml/eu-north-1:\n\n" +
        '  - "name" length must be less than or equal to 10 characters long',
    ))

  test("Validation error from stack group schema", () =>
    executeDeployStacksCommand({
      projectDir,
      commandPath: "/b/two.yml",
    }).expectCommandToThrow(
      "Validation errors in name of stack /b/two.yml/eu-north-1:\n\n" +
        '  - "name" length must be less than or equal to 10 characters long',
    ))

  test("Successful deploy", () =>
    executeDeployStacksCommand({
      projectDir,
      commandPath: "/b/three.yml",
    })
      .expectCommandToSucceed()
      .expectStackCreateSuccess({
        stackName: "this-is-ok",
        stackPath: "/b/three.yml/eu-north-1",
      })
      .assert())
})
