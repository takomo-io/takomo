/**
 * Test selecting deployment targets with wildcards.
 */

import { executeDeployTargetsCommand } from "@takomo/test-integration"

const projectDir = "configs/target-name-wildcards"

describe("Target name wildcards", () => {
  test("With no wildcard", () =>
    executeDeployTargetsCommand({
      projectDir,
      targets: ["hello"],
    })
      .expectCommandToSucceed()
      .expectResults({
        deploymentGroupPath: "applications",
        targetResults: [{ name: "hello" }],
      })
      .assert())

  test("With starting wildcard", () =>
    executeDeployTargetsCommand({
      projectDir,
      targets: ["%hello"],
    })
      .expectCommandToSucceed()
      .expectResults({
        deploymentGroupPath: "applications",
        targetResults: [{ name: "hello" }, { name: "say-hello" }],
      })
      .assert())

  test("With ending wildcard", () =>
    executeDeployTargetsCommand({
      projectDir,
      targets: ["hello%"],
    })
      .expectCommandToSucceed()
      .expectResults({
        deploymentGroupPath: "applications",
        targetResults: [{ name: "hello" }, { name: "hello-world" }],
      })
      .assert())

  test("With starting and ending wildcard", () =>
    executeDeployTargetsCommand({
      projectDir,
      targets: ["%hello%"],
    })
      .expectCommandToSucceed()
      .expectResults({
        deploymentGroupPath: "applications",
        targetResults: [
          { name: "hello" },
          { name: "hello-world" },
          { name: "say-hello" },
          { name: "say-hello-world" },
        ],
      })
      .assert())
})
