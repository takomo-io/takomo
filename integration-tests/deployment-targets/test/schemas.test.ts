/**
 * Test deployment targets schemas.
 *
 * @testenv-recycler-count 2
 */

import { executeDeployTargetsCommand } from "@takomo/test-integration"

const projectDir = "configs/schemas"

describe("Deployment targets schemas", () => {
  test("Successful deploy", async () => {
    const { results } = await executeDeployTargetsCommand({
      projectDir,
    })
      .expectCommandToSucceed()
      .assert()

    expect(results).toHaveLength(3)
  })
})
