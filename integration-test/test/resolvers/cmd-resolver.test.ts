import { executeDeployStacksCommand } from "../../src/commands/stacks.js"

const projectDir = `${process.cwd()}/integration-test/configs/resolvers/cmd`
const stack = {
  stackPath: "/vpc.yml/eu-west-1",
  stackName: "vpc",
}

describe("Command resolver", () => {
  test("Deploy", () =>
    executeDeployStacksCommand({ projectDir })
      .expectCommandToSucceed()
      .expectStackCreateSuccess(stack)
      .expectDeployedCfStackV2({
        ...stack,
        outputs: {
          LastLine: "line 6",
          ConfidentialParamValue: "hello",
          NonConfidentialParamValue: "world",
        },
      })
      .assert())
})
