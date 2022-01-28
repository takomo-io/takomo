import { executeDeployStacksCommand } from "@takomo/test-integration"

const stackName = "app",
  stackPath = "/app.yml/eu-north-1",
  projectDir = "configs/inline-template"

describe("Inline template", () => {
  test("Deploy", () =>
    executeDeployStacksCommand({ projectDir, logLevel: "trace" })
      .expectCommandToSucceed()
      .expectStackCreateSuccess({
        stackName,
        stackPath,
      })
      .assert())
})
