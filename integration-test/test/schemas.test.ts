import { executeDeployStacksCommand } from "../src/commands/stacks.js"

const projectDir = `${process.cwd()}/integration-test/configs/schemas`
const stack1 = { stackPath: "/stack1.yml/eu-west-1", stackName: "stack1" }
const stack2 = {
  stackPath: "/nested/stack2.yml/eu-west-1",
  stackName: "nested-stack2",
}

describe("Schemas", () => {
  test("No validation errors", () =>
    executeDeployStacksCommand({
      projectDir,
      var: [
        "age=40",
        "age2=40",
        "greeting=hello",
        "environment=dev",
        "stackGroupCostCenter=code",
        "stackCostCenter=code",
      ],
    })
      .expectCommandToSucceed()
      .expectStackCreateSuccess(stack1, stack2)
      .assert())

  test("Validation errors in stack data", () =>
    executeDeployStacksCommand({
      projectDir,
      var: [
        "age=40",
        "age2=40",
        "greeting=good-day",
        "environment=dev",
        "stackGroupCostCenter=code",
        "stackCostCenter=code",
      ],
    }).expectCommandToThrow(
      "Validation errors in data configuration of stack /stack1.yml/eu-west-1:\n\n" +
        '  - "greeting" length must be less than or equal to 5 characters long',
    ))

  test("Validation errors in stack tags", () =>
    executeDeployStacksCommand({
      projectDir,
      var: [
        "age=40",
        "age2=40",
        "greeting=good-day",
        "environment=dev",
        "stackGroupCostCenter=code",
        "stackCostCenter=adsdasdsaasddsaa",
      ],
    }).expectCommandToThrow(
      "Validation errors in data configuration of stack /stack1.yml/eu-west-1:\n\n" +
        '  - "greeting" length must be less than or equal to 5 characters long',
    ))

  test("Validation errors in nested stack data", () =>
    executeDeployStacksCommand({
      projectDir,
      var: [
        "age=40",
        "age2=50",
        "greeting=hello",
        "environment=dev",
        "stackGroupCostCenter=code",
        "stackCostCenter=code",
      ],
    }).expectCommandToThrow(
      "Validation errors in data configuration of stack /nested/stack2.yml/eu-west-1:\n\n" +
        '  - "age" must be less than or equal to 40',
    ))
})
