/**
 * @testenv-recycler-count 2
 */

import { executeDeployTargetsCommand } from "@takomo/test-integration"

const projectDir = "configs/repository"

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
