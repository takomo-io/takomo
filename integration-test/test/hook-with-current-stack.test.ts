import { executeDeployStacksCommand } from "../src/commands/stacks.js"

describe("Hook with current stack", () => {
  test("Create stack", () =>
    executeDeployStacksCommand({
      projectDir: `${process.cwd()}/integration-test/configs/hook-with-current-stack`,
      commandPath: "/a.yml",
    })
      .expectCommandToSucceed()
      .expectStackCreateSuccess({
        stackPath: "/a.yml/eu-north-1",
        stackName: "a",
        expectDeployedStack: {
          outputs: {
            CurrentStackName: "undefined",
          },
        },
      })
      .assert())

  test("Update stack", () =>
    executeDeployStacksCommand({
      projectDir: `${process.cwd()}/integration-test/configs/hook-with-current-stack`,
      commandPath: "/a.yml",
    })
      .expectCommandToSucceed()
      .expectStackUpdateSuccess({
        stackPath: "/a.yml/eu-north-1",
        stackName: "a",
        expectDeployedStack: {
          outputs: {
            CurrentStackName: "a",
          },
        },
      })
      .assert())
})
