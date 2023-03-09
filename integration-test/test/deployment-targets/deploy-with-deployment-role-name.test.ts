/**
 * @testenv-recycler-count 2
 */

import { executeDeployTargetsCommand } from "../../src/commands/targets/deploy-targets.js"
import { executeUndeployTargetsCommand } from "../../src/commands/targets/undeploy-targets.js"

const projectDir = `${process.cwd()}/integration-test/configs/deployment-targets/simple`

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
