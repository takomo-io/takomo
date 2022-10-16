import {
  executeDeployStacksCommand,
  executeUndeployStacksCommand,
} from "../../src/commands/stacks"
import { pathToConfigs } from "../../src/util"

const projectDir = pathToConfigs("obsolete", "undeploy-with-obsolete-dependent")

const primaryStack = {
  stackName: "primary",
  stackPath: "/primary.yml/eu-north-1",
}

describe("undeploying stacks with obsolete dependent stacks", () => {
  test("deploy all", () =>
    executeDeployStacksCommand({
      projectDir,
      commandPath: "/primary.yml/eu-north-1",
    })
      .expectCommandToSucceed()
      .expectStackCreateSuccess(primaryStack)
      .assert())

  test("undeploy doesn't touch the obsolete stack", () =>
    executeUndeployStacksCommand({ projectDir })
      .expectCommandToSucceed()
      .expectStackDeleteSuccess(primaryStack)
      .assert())
})
