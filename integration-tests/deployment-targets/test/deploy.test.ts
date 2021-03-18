/**
 * @testenv-recycler-count 5
 */

import {
  executeDeployTargetsCommand,
  executeUndeployTargetsCommand,
} from "@takomo/test-integration"

const projectDir = "configs/simple"

describe("Deployment group commands", () => {
  test("Deploy single deployment group", async () => {
    const { results } = await executeDeployTargetsCommand({
      projectDir,
      groups: ["Environments/Test"],
    })
      .expectCommandToSucceed()
      .assert()

    expect(results).toHaveLength(1)

    const [testGroup] = results

    expect(testGroup.path).toBe("Environments/Test")
    expect(testGroup.results).toHaveLength(3)
    expect(testGroup.success).toBeTruthy()
    expect(testGroup.status).toBe("SUCCESS")

    const [t3, t4, t5] = testGroup.results
    expect(t3.name).toBe("three")
    expect(t4.name).toBe("four")
    expect(t5.name).toBe("five")
  })

  test("Deploy single target", async () => {
    const { results } = await executeDeployTargetsCommand({
      projectDir,
      targets: ["two"],
    })
      .expectCommandToSucceed()
      .assert()

    expect(results).toHaveLength(1)

    const [devGroup] = results

    expect(devGroup.path).toBe("Environments/Dev")
    expect(devGroup.results).toHaveLength(1)
    expect(devGroup.success).toBeTruthy()
    expect(devGroup.status).toBe("SUCCESS")

    const [t2] = devGroup.results
    expect(t2.name).toBe("two")
    expect(t2.status).toBe("SUCCESS")
    expect(t2.results).toHaveLength(1)

    const [set1] = t2.results
    expect(set1.configSetName).toBe("logs")
    expect(set1.status).toBe("SUCCESS")

    expect(set1.results).toHaveLength(1)
    expect(set1.results[0].commandPath).toBe("/logs.yml")
    expect(set1.results[0].result.results).toHaveLength(1)
    expect(set1.results[0].result.results[0].stack.path).toBe(
      "/logs.yml/eu-west-1",
    )
  })

  test("Undeploy all", async () => {
    const { results } = await executeUndeployTargetsCommand({
      projectDir,
    })
      .expectCommandToSucceed()
      .assert()

    expect(results).toHaveLength(2)
    const [devGroup, testGroup] = results

    expect(devGroup.path).toBe("Environments/Dev")
    expect(devGroup.results).toHaveLength(2)
    expect(devGroup.success).toBeTruthy()
    expect(devGroup.status).toBe("SUCCESS")

    const [t1, t2] = devGroup.results
    expect(t1.name).toBe("one")
    expect(t2.name).toBe("two")

    expect(testGroup.path).toBe("Environments/Test")
    expect(testGroup.results).toHaveLength(3)
    expect(testGroup.success).toBeTruthy()
    expect(testGroup.status).toBe("SUCCESS")

    const [t3, t4, t5] = testGroup.results
    expect(t3.name).toBe("three")
    expect(t4.name).toBe("four")
    expect(t5.name).toBe("five")
  })
})
