import { executeDeployStacksCommand } from "@takomo/test-integration"

const projectDir = "configs/custom-resolvers",
  stackName = "examples-custom-resolver-stack",
  stackPath = "/stack.yml/eu-north-1"

describe("Custom resolvers", () => {
  test("Deploy", () =>
    executeDeployStacksCommand({ projectDir })
      .expectCommandToSucceed()
      .expectStackCreateSuccess({ stackPath, stackName })
      .assert())
})
