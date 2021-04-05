/**
 * Test feature flags.
 */

import { FeatureDisabledError } from "@takomo/core"
import {
  executeTeardownTargetsCommand,
  executeUndeployTargetsCommand,
} from "@takomo/test-integration"

describe("Feature flags", () => {
  test("Undeploy fails when undeploy feature flag is set to false", async () => {
    await executeUndeployTargetsCommand({
      projectDir: "configs/feature-flags/disable-undeploy",
    }).expectCommandToThrow(
      new FeatureDisabledError("deploymentTargetsUndeploy"),
    )
  })

  test("Undeploy succeeds when undeploy feature flag is enabled from command line", async () => {
    await executeUndeployTargetsCommand({
      projectDir: "configs/feature-flags/disable-undeploy",
      feature: ["deploymentTargetsUndeploy=true"],
    })
      .expectCommandToSkip()
      .assert()
  })

  test("Tear down fails when tear down feature flag is set to false", async () => {
    await executeTeardownTargetsCommand({
      projectDir: "configs/feature-flags/disable-teardown",
    }).expectCommandToThrow(
      new FeatureDisabledError("deploymentTargetsTearDown"),
    )
  })

  test("Tear down fails when tear down feature flag is enabled from command line", async () => {
    await executeTeardownTargetsCommand({
      projectDir: "configs/feature-flags/disable-teardown",
      feature: ["deploymentTargetsTearDown=true"],
    })
      .expectCommandToSkip()
      .assert()
  })
})
