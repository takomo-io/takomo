/**
 * @testenv-recycler-count 2
 */

import {
  executeBootstrapTargetsCommand,
  executeTeardownTargetsCommand,
} from "@takomo/test-integration"

const projectDir = "configs/simple"

describe("Bootstrapping", () => {
  test("bootstrap all", async () => {
    const { results } = await executeBootstrapTargetsCommand({
      projectDir,
      configFile: "targets-4.yml",
    })
      .expectCommandToSucceed()
      .assert()

    expect(results).toHaveLength(1)

    const [exampleGroup] = results

    expect(exampleGroup.path).toBe("Example")
    expect(exampleGroup.results).toHaveLength(1)
    expect(exampleGroup.success).toBeTruthy()
    expect(exampleGroup.status).toBe("SUCCESS")

    const [target] = exampleGroup.results
    expect(target.name).toBe("two")
  })

  test("tear down all", async () => {
    const { results } = await executeTeardownTargetsCommand({
      configFile: "targets-4.yml",
      projectDir,
    })
      .expectCommandToSucceed()
      .assert()

    expect(results).toHaveLength(1)

    const [exampleGroup] = results

    expect(exampleGroup.path).toBe("Example")
    expect(exampleGroup.results).toHaveLength(1)
    expect(exampleGroup.success).toBeTruthy()
    expect(exampleGroup.status).toBe("SUCCESS")

    const [target] = exampleGroup.results
    expect(target.name).toBe("two")
  })
})
