/**
 * @testenv-recycler-count 2
 */

import {
  executeDeployTargetsCommand,
  executeUndeployTargetsCommand,
} from "@takomo/test-integration"

const projectDir = "configs/simple"

describe("Deployment with deployment role name", () => {
  test("Deploy all", () =>
    executeDeployTargetsCommand({
      projectDir,
      configFile: "targets-5.yml",
    })
      .expectCommandToSucceed()
      .expectResults({
        deploymentGroupPath: "foobar",
        targetResults: [{ name: "one" }, { name: "two" }],
      })
      .assert())

  test("Undeploy all", () =>
    executeUndeployTargetsCommand({
      projectDir,
      configFile: "targets-5.yml",
    })
      .expectCommandToSucceed()
      .expectResults({
        deploymentGroupPath: "foobar",
        targetResults: [{ name: "one" }, { name: "two" }],
      })
      .assert())
})
