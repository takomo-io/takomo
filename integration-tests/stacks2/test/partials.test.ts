import { executeDeployStacksCommand } from "@takomo/test-integration"

describe("Partials", () => {
  test("Deploy", () =>
    executeDeployStacksCommand({
      projectDir: "configs/partials",
      logLevel: "trace",
    })
      .expectCommandToSucceed()
      .expectStackCreateSuccess({
        stackPath: "/p.yml/eu-north-1",
        stackName: "p",
        expectDeployedStack: {
          outputs: {
            Out: "XX",
          },
        },
      })
      .assert())
})
