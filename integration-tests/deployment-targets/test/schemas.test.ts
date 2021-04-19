/**
 * Test deployment targets schemas.
 *
 * @testenv-recycler-count 2
 */

import { executeDeployTargetsCommand } from "@takomo/test-integration"

const projectDir = "configs/schemas"

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
