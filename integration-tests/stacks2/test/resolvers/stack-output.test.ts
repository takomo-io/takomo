import { executeDeployStacksCommand } from "@takomo/test-integration"

const projectDir = "configs/resolvers/stack-output"

describe("Stack output resolvers", () => {
  test("Deploy", () =>
    executeDeployStacksCommand({ projectDir })
      .expectCommandToSucceed()
      .expectStackCreateSuccess({
        stackName: "vpc",
        stackPath: "/vpc.yml/eu-west-1",
      })
      .expectStackCreateSuccess({
        stackName: "security-groups",
        stackPath: "/security-groups.yml/eu-west-1",
      })
      .assert())
})
