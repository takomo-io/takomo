/**
 * Test selecting deployment targets with labels
 */

import { executeDeployTargetsCommand } from "../../src/commands/targets/deploy-targets.js"

const projectDir = `${process.cwd()}/integration-test/configs/deployment-targets/labels`

describe("Labels", () => {
  test("Non-exiting label deploys nothing", () =>
    executeDeployTargetsCommand({
      projectDir,
      labels: ["hello"],
    })
      .expectCommandToSkip()
      .assert())

  test("Label applied in two deployment groups", () =>
    executeDeployTargetsCommand({
      projectDir,
      labels: ["networking"],
    })
      .expectCommandToSucceed()
      .expectResults({
        deploymentGroupPath: "infra/networking",
        targetResults: [{ name: "networking-1" }, { name: "networking-2" }],
      })
      .assert())

  test("Label applied in two deployment groups", () =>
    executeDeployTargetsCommand({
      projectDir,
      labels: ["networking"],
    })
      .expectCommandToSucceed()
      .expectResults({
        deploymentGroupPath: "infra/networking",
        targetResults: [{ name: "networking-1" }, { name: "networking-2" }],
      })
      .assert())

  test("Use label to narrow down selection done with groups", () =>
    executeDeployTargetsCommand({
      projectDir,
      groups: ["infra"],
      labels: ["other"],
    })
      .expectCommandToSucceed()
      .expectResults({
        deploymentGroupPath: "infra/backups",
        targetResults: [{ name: "backups-1" }],
      })
      .assert())

  test("Multiple labels", () =>
    executeDeployTargetsCommand({
      projectDir,
      labels: ["test", "prod"],
    })
      .expectCommandToSucceed()
      .expectResults({
        deploymentGroupPath: "infra/networking",
        targetResults: [{ name: "networking-1" }, { name: "networking-2" }],
      })
      .assert())

  test("Use target name to narrow down selection done with labels", () =>
    executeDeployTargetsCommand({
      projectDir,
      labels: ["other"],
      targets: ["application-1"],
    })
      .expectCommandToSucceed()
      .expectResults({
        deploymentGroupPath: "applications",
        targetResults: [{ name: "application-1" }],
      })
      .assert())

  test("Use target name to narrow down selection done with labels #2", () =>
    executeDeployTargetsCommand({
      projectDir,
      labels: ["other"],
      targets: ["application-2"],
    })
      .expectCommandToSkip()
      .assert())

  test("Excluding with labels", () =>
    executeDeployTargetsCommand({
      projectDir,
      excludeLabels: ["other"],
    })
      .expectCommandToSucceed()
      .expectResults(
        {
          deploymentGroupPath: "infra/networking",
          targetResults: [{ name: "networking-1" }, { name: "networking-2" }],
        },
        {
          deploymentGroupPath: "applications",
          targetResults: [{ name: "application-2" }],
        },
      )
      .assert())

  test("Exclude label takes precedence over inclusive label", () =>
    executeDeployTargetsCommand({
      projectDir,
      labels: ["prod"],
      excludeLabels: ["prod"],
    })
      .expectCommandToSkip()
      .assert())

  test("Exclude label takes precedence over inclusive target", () =>
    executeDeployTargetsCommand({
      projectDir,
      excludeLabels: ["prod"],
      targets: ["networking-1", "networking-2"],
    })
      .expectCommandToSucceed()
      .expectResults({
        deploymentGroupPath: "infra/networking",
        targetResults: [{ name: "networking-2" }],
      })
      .assert())
})
