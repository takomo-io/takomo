/**
 * @testenv-recycler-count 2
 */

import { executeDeployTargetsCommand } from "../../src/commands/targets/deploy-targets.js"

const projectDir = `${process.cwd()}/integration-test/configs/deployment-targets/repository`

describe("Filesystem deployment target repository", () => {
  test("Deploy all", () =>
    executeDeployTargetsCommand({
      projectDir,
    })
      .expectCommandToSucceed()
      .expectResults(
        {
          deploymentGroupPath: "development",
          targetResults: [{ name: "first" }, { name: "second" }],
        },
        {
          deploymentGroupPath: "production",
          targetResults: [{ name: "third" }],
        },
      )
      .assert())
})
