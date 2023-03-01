import { executeDeployStacksCommand } from "../src/commands/stacks.js"

const stackName = "app",
  stackPath = "/app.yml/eu-north-1",
  projectDir = `${process.cwd()}/integration-test/configs/inline-template`

describe("Inline template", () => {
  test("Deploy", () =>
    executeDeployStacksCommand({ projectDir })
      .expectCommandToSucceed()
      .expectStackCreateSuccess({
        stackName,
        stackPath,
      })
      .assert())
})
