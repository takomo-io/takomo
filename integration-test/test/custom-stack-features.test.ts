import { executeDeployStacksCommand } from "../src/commands/stacks.js"

const projectDir = `${process.cwd()}/integration-test/configs/custom-stack-features`

const appStack = {
  stackPath: "/app.yml/eu-north-1",
  stackName: "app-stack",
}

const logsStack = {
  stackPath: "/logs.yml/eu-north-1",
  stackName: "logs",
}

const randomId = Date.now()

describe("Custom stack features", () => {
  test("Deploy", () =>
    executeDeployStacksCommand({
      projectDir,
      var: [`randomId=${randomId}`],
    })
      .expectCommandToSucceed()
      .expectStackCreateSuccess(
        {
          ...appStack,
          expectDeployedStack: {
            outputs: {
              NameOutput: `log-group-${randomId}`,
              ExampleOutput: "example-value",
            },
            tags: {
              Project: "Takomo",
              Purpose: "IntegrationTest",
            },
          },
        },
        logsStack,
      )
      .assert())
})
