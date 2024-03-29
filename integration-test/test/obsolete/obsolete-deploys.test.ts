import { executeDeployStacksCommand } from "../../src/commands/stacks.js"
import { pathToConfigs } from "../../src/util.js"

const projectDir = pathToConfigs("obsolete", "obsolete-deploys")

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
