import { executeDeployStacksCommand } from "../src/commands/stacks"

describe("Partials", () => {
  test("Deploy", () =>
    executeDeployStacksCommand({
      projectDir: `${process.cwd()}/integration-test/configs/partials`,
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
