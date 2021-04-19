/**
 * @testenv-recycler-count 2
 */

import {
  executeBootstrapTargetsCommand,
  executeTeardownTargetsCommand,
} from "@takomo/test-integration"

const projectDir = "configs/simple"

describe("Bootstrapping", () => {
  test("Bootstrap all", () =>
    executeBootstrapTargetsCommand({
      projectDir,
      configFile: "targets-4.yml",
    })
      .expectCommandToSucceed()
      .expectResults({
        deploymentGroupPath: "Example",
        targetResults: [
          {
            name: "two",
          },
        ],
      })
      .assert())

  test("Tear down all", () =>
    executeTeardownTargetsCommand({
      configFile: "targets-4.yml",
      projectDir,
    })
      .expectCommandToSucceed()
      .expectResults({
        deploymentGroupPath: "Example",
        targetResults: [{ name: "two" }],
      })
      .assert())
})
