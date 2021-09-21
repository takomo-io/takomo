import {
  executeDeployStacksCommand,
  executeUndeployStacksCommand,
} from "@takomo/test-integration"

const projectDir = "configs/large-number-of-stacks"

const createStacks = (count: number) => {
  const list = []
  for (let i = 1; i <= count; i++) {
    list.push({
      stackName: `stack-${i}`,
      stackPath: `/stack-${i}.yml/eu-north-1`,
    })
  }

  return list
}

const stacks = createStacks(120)

describe("Large number of stacks", () => {
  test("First deploy", () =>
    executeDeployStacksCommand({ projectDir, var: ["template=first.yml"] })
      .expectCommandToSucceed()
      .expectStackCreateSuccess(...stacks)
      .assert())

  test("Second deploy without changes", () =>
    executeDeployStacksCommand({ projectDir, var: ["template=first.yml"] })
      .expectCommandToSucceed()
      .expectStackUpdateSuccessWithNoChanges(...stacks)
      .assert())

  test("Deploy a single stack without changes", () =>
    executeDeployStacksCommand({ projectDir, var: ["template=first.yml"] })
      .expectCommandToSucceed()
      .expectStackUpdateSuccessWithNoChanges({
        stackName: "stack-113",
        stackPath: "/stack-113.yml/eu-north-1",
      })
      .assert())

  test("Third deploy with changes", () =>
    executeDeployStacksCommand({ projectDir, var: ["template=second.yml"] })
      .expectCommandToSucceed()
      .expectStackUpdateSuccess(...stacks)
      .assert())

  test("Undeploy single stack", () =>
    executeUndeployStacksCommand({
      projectDir,
      var: ["template=second.yml"],
      commandPath: "/stack-111.yml",
    })
      .expectCommandToSucceed()
      .expectStackDeleteSuccess({
        stackName: "stack-111",
        stackPath: "/stack-111.yml/eu-north-1",
      })
      .assert())

  test("Undeploy rest of the stacks", () =>
    executeUndeployStacksCommand({
      projectDir,
      var: ["template=second.yml"],
    })
      .expectCommandToSucceed()
      .expectStackDeleteSuccess(
        ...stacks.filter((s) => s.stackName !== "stack-111"),
      )
      .expectSkippedStackResult({
        message: "Stack not found",
        stackName: "stack-111",
        stackPath: "/stack-111.yml/eu-north-1",
      })
      .assert())
})
