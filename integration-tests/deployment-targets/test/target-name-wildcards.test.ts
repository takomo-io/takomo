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

  test("With excluding starting wildcard", () =>
    executeDeployTargetsCommand({
      projectDir,
      excludeTargets: ["%hello"],
    })
      .expectCommandToSucceed()
      .expectResults({
        deploymentGroupPath: "applications",
        targetResults: [{ name: "hello-world" }, { name: "say-hello-world" }],
      })
      .assert())

  test("With excluding ending wildcard", () =>
    executeDeployTargetsCommand({
      projectDir,
      excludeTargets: ["hello%"],
    })
      .expectCommandToSucceed()
      .expectResults({
        deploymentGroupPath: "applications",
        targetResults: [{ name: "say-hello" }, { name: "say-hello-world" }],
      })
      .assert())

  test("With excluding starting and ending wildcard", () =>
    executeDeployTargetsCommand({
      projectDir,
      excludeTargets: ["%hello%"],
    })
      .expectCommandToSkip()
      .assert())

  test("Exclude target takes precedence over inclusive target", () =>
    executeDeployTargetsCommand({
      projectDir,
      targets: ["hello"],
      excludeTargets: ["hello"],
    })
      .expectCommandToSkip()
      .assert())

  test("Exclude target takes precedence over inclusive target #2", () =>
    executeDeployTargetsCommand({
      projectDir,
      targets: ["hello%"],
      excludeTargets: ["hello-world"],
    })
      .expectCommandToSucceed()
      .expectResults({
        deploymentGroupPath: "applications",
        targetResults: [{ name: "hello" }],
      })
      .assert())
})
