/**
 * Test feature flags.
 */

import { FeatureDisabledError } from "../../../src/config/project-config"
import { executeTeardownTargetsCommand } from "../../src/commands/targets/tear-down-targets"
import { executeUndeployTargetsCommand } from "../../src/commands/targets/undeploy-targets"

describe("Feature flags", () => {
  test("Undeploy fails when undeploy feature flag is set to false", async () => {
    await executeUndeployTargetsCommand({
      projectDir: `${process.cwd()}/integration-test/configs/deployment-targets/feature-flags/disable-undeploy`,
    }).expectCommandToThrow(
      new FeatureDisabledError("deploymentTargetsUndeploy"),
    )
  })

  test("Undeploy succeeds when undeploy feature flag is enabled from command line", async () => {
    await executeUndeployTargetsCommand({
      projectDir: `${process.cwd()}/integration-test/configs/deployment-targets/feature-flags/disable-undeploy`,
      feature: ["deploymentTargetsUndeploy=true"],
    })
      .expectCommandToSkip()
      .assert()
  })

  test("Tear down fails when tear down feature flag is set to false", async () => {
    await executeTeardownTargetsCommand({
      projectDir: `${process.cwd()}/integration-test/configs/deployment-targets/feature-flags/disable-teardown`,
    }).expectCommandToThrow(
      new FeatureDisabledError("deploymentTargetsTearDown"),
    )
  })

  test("Tear down fails when tear down feature flag is enabled from command line", async () => {
    await executeTeardownTargetsCommand({
      projectDir: `${process.cwd()}/integration-test/configs/deployment-targets/feature-flags/disable-teardown`,
      feature: ["deploymentTargetsTearDown=true"],
    })
      .expectCommandToSkip()
      .assert()
  })
})
