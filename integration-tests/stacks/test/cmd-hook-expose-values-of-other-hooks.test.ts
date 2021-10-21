import { executeDeployStacksCommand } from "@takomo/test-integration"

const projectDir = "configs/cmd-hook-expose-values-of-other-hooks"
const stack = {
  stackName: "hooks",
  stackPath: "/hooks.yml/eu-north-1",
}

describe("Cmd hook", () => {
  test("Exposes values of other hooks", () =>
    executeDeployStacksCommand({
      projectDir,
    })
      .expectCommandToSucceed()
      .expectStackCreateSuccess({
        stackName: "hooks",
        stackPath: "/hooks.yml/eu-north-1",
      })
      .expectDeployedCfStackV2({
        ...stack,
        outputs: {
          One: "HELLO",
        },
      })
      .assert())
})
