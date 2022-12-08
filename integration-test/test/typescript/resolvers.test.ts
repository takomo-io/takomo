import { executeDeployStacksCommand } from "../../src/commands/stacks"

const projectDir = `${process.cwd()}/integration-test/configs/typescript/resolvers`
const stack = {
  stackPath: "/a.yml/eu-north-1",
  stackName: "a",
}

describe("Resolvers from typescript configuration", () => {
  test("Create stack", () =>
    executeDeployStacksCommand({
      projectDir,
    })
      .expectCommandToSucceed()
      .expectStackCreateSuccess({
        ...stack,
        expectDeployedStack: {
          outputs: {
            Param1Value: "hello",
          },
        },
      })
      .assert())
})
