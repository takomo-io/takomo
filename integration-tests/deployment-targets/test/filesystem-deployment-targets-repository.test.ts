/**
 * @testenv-recycler-count 2
 */

import { executeDeployTargetsCommand } from "@takomo/test-integration"

const projectDir = "configs/repository"

describe("Filesystem deployment target repository", () => {
  test("Deploy all", async () => {
    const { results } = await executeDeployTargetsCommand({
      projectDir,
    })
      .expectCommandToSucceed()
      .assert()

    expect(results).toHaveLength(2)

    const [devGroup, prodGroup] = results

    expect(devGroup.path).toBe("development")
    expect(devGroup.results).toHaveLength(2)
    expect(devGroup.success).toBeTruthy()
    expect(devGroup.status).toBe("SUCCESS")

    const [d1, d2] = devGroup.results
    expect(d1.name).toBe("first")
    expect(d2.name).toBe("second")

    expect(prodGroup.path).toBe("production")
    expect(prodGroup.results).toHaveLength(1)
    expect(prodGroup.success).toBeTruthy()
    expect(prodGroup.status).toBe("SUCCESS")

    const [p1] = prodGroup.results
    expect(p1.name).toBe("third")
  })
})
