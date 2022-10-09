/**
 * @testenv-recycler-count 2
 */

import { executeDeployTargetsCommand } from "../../src/commands/targets/deploy-targets"

const projectDir = `${process.cwd()}/integration-test/configs/deployment-targets/repository-infer-deployment-target-name`

describe("Filesystem deployment target repository with inferDeploymentTargetNameFromFileName", () => {
  test("Deploy development", () =>
    executeDeployTargetsCommand({
      projectDir,
      groups: ["development"],
    })
      .expectCommandToSucceed()
      .expectResults({
        deploymentGroupPath: "development",
        targetResults: [{ name: "aaa" }, { name: "ccc" }],
      })
      .assert())

  test("Deploy production", () =>
    executeDeployTargetsCommand({
      projectDir,
      groups: ["production"],
    })
      .expectCommandToSucceed()
      .expectResults({
        deploymentGroupPath: "production",
        targetResults: [{ name: "bbb" }],
      })
      .assert())

  test("Deploy nested group", () =>
    executeDeployTargetsCommand({
      projectDir,
      groups: ["nested/group"],
    })
      .expectCommandToSucceed()
      .expectResults({
        deploymentGroupPath: "nested/group",
        targetResults: [{ name: "ddd" }],
      })
      .assert())
})
