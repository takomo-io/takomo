/**
 * Test selecting deployment targets with wildcards.
 */

import { executeDeployTargetsCommand } from "@takomo/test-integration"

const projectDir = "configs/target-name-wildcards"

describe("Target name wildcards", () => {
  test("With no wildcard", async () => {
    const { results } = await executeDeployTargetsCommand({
      projectDir,
      targets: ["hello"],
    })
      .expectCommandToSucceed()
      .assert()

    expect(results).toHaveLength(1)
    expect(results[0].results).toHaveLength(1)
    expect(results[0].results[0].name).toStrictEqual("hello")
  })

  test("With starting wildcard", async () => {
    const { results } = await executeDeployTargetsCommand({
      projectDir,
      targets: ["*hello"],
    })
      .expectCommandToSucceed()
      .assert()

    expect(results).toHaveLength(1)
    expect(results[0].results).toHaveLength(2)
    expect(results[0].results[0].name).toStrictEqual("hello")
    expect(results[0].results[1].name).toStrictEqual("say-hello")
  })

  test("With ending wildcard", async () => {
    const { results } = await executeDeployTargetsCommand({
      projectDir,
      targets: ["hello*"],
    })
      .expectCommandToSucceed()
      .assert()

    expect(results).toHaveLength(1)
    expect(results[0].results).toHaveLength(2)
    expect(results[0].results[0].name).toStrictEqual("hello")
    expect(results[0].results[1].name).toStrictEqual("hello-world")
  })

  test("With starting and ending wildcard", async () => {
    const { results } = await executeDeployTargetsCommand({
      projectDir,
      targets: ["*hello*"],
    })
      .expectCommandToSucceed()
      .assert()

    expect(results).toHaveLength(1)
    expect(results[0].results).toHaveLength(4)
    expect(results[0].results[0].name).toStrictEqual("hello")
    expect(results[0].results[1].name).toStrictEqual("hello-world")
    expect(results[0].results[2].name).toStrictEqual("say-hello")
    expect(results[0].results[3].name).toStrictEqual("say-hello-world")
  })
})
