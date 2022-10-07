import { executeDeployStacksCommand } from "../src/commands/stacks"

const projectDir = `${process.cwd()}/integration-test/configs/custom-resolvers`,
  stackName = "examples-custom-resolver-stack",
  stackPath = "/stack.yml/eu-north-1"

describe("Custom resolvers", () => {
  test("Deploy", () =>
    executeDeployStacksCommand({ projectDir })
      .expectCommandToSucceed()
      .expectStackCreateSuccess({ stackPath, stackName })
      .assert())
})
