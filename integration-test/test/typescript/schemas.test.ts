import { executeDeployStacksCommand } from "../../src/commands/stacks"

const projectDir = `${process.cwd()}/integration-test/configs/typescript/schemas`
const stack = {
  stackPath: "/a.yml/eu-north-1",
  stackName: "only-valid-name",
}

const expectedError =
  'Validation errors in name of stack /a.yml/eu-north-1:\n\n  - "name" must be [only-valid-name]'

describe("Schemas from typescript configuration", () => {
  test("Create stack with invalid name", () =>
    executeDeployStacksCommand({
      projectDir,
      var: ["name=not-ok"],
    }).expectCommandToThrow(expectedError))

  test("Create stack with valid name", () =>
    executeDeployStacksCommand({
      projectDir,
      var: ["name=only-valid-name"],
    })
      .expectCommandToSucceed()
      .expectStackCreateSuccess(stack)
      .assert())
})
