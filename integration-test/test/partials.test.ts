import { executeDeployStacksCommand } from "../src/commands/stacks.js"

describe("Partials", () => {
  test("Deploy", () =>
    executeDeployStacksCommand({
      projectDir: `${process.cwd()}/integration-test/configs/partials`,
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
