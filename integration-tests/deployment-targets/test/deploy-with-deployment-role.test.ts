/**
 * @testenv-recycler-count 2
 */

import {
  executeDeployTargetsCommand,
  executeUndeployTargetsCommand,
} from "@takomo/test-integration"

const projectDir = "configs/simple"

describe("Deployment with deployment role", () => {
  test("Deploy all", () =>
    executeDeployTargetsCommand({
      projectDir,
      configFile: "targets-2.yml",
    })
      .expectCommandToSucceed()
      .expectResults({
        deploymentGroupPath: "Example",
        targetResults: [{ name: "bar" }, { name: "foo" }],
      })
      .assert())

  test("Undeploy all", () =>
    executeUndeployTargetsCommand({
      projectDir,
      configFile: "targets-2.yml",
    })
      .expectCommandToSucceed()
      .expectResults({
        deploymentGroupPath: "Example",
        targetResults: [{ name: "bar" }, { name: "foo" }],
      })
      .assert())
})
