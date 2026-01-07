import { TakomoError } from "../../src/utils/errors.js"
import {
  executeDeployStacksCommand,
  executeUndeployStacksCommand,
} from "../src/commands/stacks.js"

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
      var: [`randomId=${randomId}`, "terminationProtection=false"],
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

  test("Undeploy with termination protection enabled", () =>
    executeUndeployStacksCommand({
      projectDir,
      var: [`randomId=${randomId}`, "terminationProtection=true"],
    }).expectCommandToThrow(
      new TakomoError(
        "Can't undeploy stacks because following stacks have termination protection enabled:\n\n" +
          "  - /app.yml/eu-north-1",
      ),
    ))

  test("Undeploy", () =>
    executeUndeployStacksCommand({
      projectDir,
      var: [`randomId=${randomId}`, "terminationProtection=false"],
    })
      .expectCommandToSucceed()
      .expectStackDeleteSuccess(appStack, logsStack)
      .assert())
})
