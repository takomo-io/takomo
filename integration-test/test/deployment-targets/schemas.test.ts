/**
 * Test deployment targets schemas.
 *
 * @testenv-recycler-count 2
 */

import { executeDeployTargetsCommand } from "../../src/commands/targets/deploy-targets.js"

const projectDir = `${process.cwd()}/integration-test/configs/deployment-targets/schemas`

describe("Deployment targets schemas", () => {
  test("Successful deploy", () =>
    executeDeployTargetsCommand({
      projectDir,
    })
      .expectCommandToSucceed()
      .expectResults(
        {
          deploymentGroupPath: "workload/marketing",
          targetResults: [{ name: "one" }],
        },
        {
          deploymentGroupPath: "workload/analytics",
          targetResults: [{ name: "two" }],
        },
        { deploymentGroupPath: "sandbox", targetResults: [{ name: "three" }] },
      )
      .assert())
})
