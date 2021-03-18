/**
 * @testenv-recycler-count 2
 */

import {
  executeDeployTargetsCommand,
  executeUndeployTargetsCommand,
} from "@takomo/test-integration"

const projectDir = "configs/simple"

describe("Deployment with deployment role name", () => {
  test("Deploy all", async () => {
    const { results } = await executeDeployTargetsCommand({
      projectDir,
      configFile: "targets-5.yml",
    })
      .expectCommandToSucceed()
      .assert()

    expect(results).toHaveLength(1)

    const [exampleGroup] = results

    expect(exampleGroup.path).toBe("foobar")
    expect(exampleGroup.results).toHaveLength(2)
    expect(exampleGroup.success).toBeTruthy()
    expect(exampleGroup.status).toBe("SUCCESS")

    const [t1, t2] = exampleGroup.results
    expect(t1.name).toBe("one")
    expect(t2.name).toBe("two")
  })

  test("Undeploy all", async () => {
    const { results } = await executeUndeployTargetsCommand({
      projectDir,
      configFile: "targets-5.yml",
    })
      .expectCommandToSucceed()
      .assert()

    expect(results).toHaveLength(1)

    const [exampleGroup] = results

    expect(exampleGroup.path).toBe("foobar")
    expect(exampleGroup.results).toHaveLength(2)
    expect(exampleGroup.success).toBeTruthy()
    expect(exampleGroup.status).toBe("SUCCESS")

    const [t1, t2] = exampleGroup.results
    expect(t1.name).toBe("one")
    expect(t2.name).toBe("two")
  })
})
