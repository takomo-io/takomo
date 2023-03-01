import { executeDeployStacksCommand } from "../../src/commands/stacks.js"

const projectDir = `${process.cwd()}/integration-test/configs/typescript/hooks`
const stack = {
  stackPath: "/a.yml/eu-north-1",
  stackName: "a",
}

describe("Hooks from typescript configuration", () => {
  test("Create stack", () =>
    executeDeployStacksCommand({
      projectDir,
    })
      .expectCommandToSucceed()
      .expectStackCreateSuccess({
        ...stack,
        expectDeployedStack: {
          outputs: {
            HookValue: "example-value",
          },
        },
      })
      .assert())
})
