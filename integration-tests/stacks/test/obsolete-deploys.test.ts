import { executeDeployStacksCommand } from "@takomo/test-integration"

const projectDir = "configs/obsolete-deploys"

describe("deploying obsolete stacks", () => {
  test("obsolete stacks are not deployed", () =>
    executeDeployStacksCommand({ projectDir })
      .expectCommandToSucceed()
      .expectStackCreateSuccess(
        {
          stackName: "s2",
          stackPath: "/s2.yml/eu-north-1",
        },
        {
          stackName: "bbb-s5",
          stackPath: "/bbb/s5.yml/eu-north-1",
        },
      )
      .assert())
})
