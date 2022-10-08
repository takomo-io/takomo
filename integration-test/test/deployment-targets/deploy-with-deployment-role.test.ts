/**
 * @testenv-recycler-count 2
 */

import { executeDeployTargetsCommand } from "../../src/commands/targets/deploy-targets"
import { executeUndeployTargetsCommand } from "../../src/commands/targets/undeploy-targets"

const projectDir = `${process.cwd()}/integration-test/configs/deployment-targets/simple`

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
