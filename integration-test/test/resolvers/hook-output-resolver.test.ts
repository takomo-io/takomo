import { executeDeployStacksCommand } from "../../src/commands/stacks.js"

const projectDir = `${process.cwd()}/integration-test/configs/resolvers/hook-output`
const stack = {
  stackPath: "/logs.yml/eu-west-1",
  stackName: "logs",
}

describe("Hook output resolver", () => {
  test("Deploy", () =>
    executeDeployStacksCommand({ projectDir })
      .expectCommandToSucceed()
      .expectStackCreateSuccess(stack)
      .expectDeployedCfStackV2({
        ...stack,
        outputs: {
          Name: "ABCDEFG1234",
        },
      })
      .assert())
})
