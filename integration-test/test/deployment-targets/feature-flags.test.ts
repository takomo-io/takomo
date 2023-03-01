/**
 * Test feature flags.
 */

import { FeatureDisabledError } from "../../../src/config/project-config.js"
import { executeUndeployTargetsCommand } from "../../src/commands/targets/undeploy-targets.js"

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
})
