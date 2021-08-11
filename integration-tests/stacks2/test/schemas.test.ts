import { executeDeployStacksCommand } from "@takomo/test-integration"

const stackPath = "/stack1.yml/eu-west-1",
  stackName = "stack1",
  projectDir = "configs/schemas"

describe("Schemas", () => {
  test("No validation errors", () =>
    executeDeployStacksCommand({
      projectDir,
      var: [
        "age=40",
        "greeting=hello",
        "environment=dev",
        "stackGroupCostCenter=code",
        "stackCostCenter=code",
      ],
    })
      .expectCommandToSucceed()
      .expectStackCreateSuccess({ stackName, stackPath })
      .assert())

  test("Validation errors in stack data", () =>
    executeDeployStacksCommand({
      projectDir,
      var: [
        "age=40",
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
        "greeting=good-day",
        "environment=dev",
        "stackGroupCostCenter=code",
        "stackCostCenter=adsdasdsaasddsaa",
      ],
    }).expectCommandToThrow(
      "Validation errors in data configuration of stack /stack1.yml/eu-west-1:\n\n" +
        '  - "greeting" length must be less than or equal to 5 characters long',
    ))
})
