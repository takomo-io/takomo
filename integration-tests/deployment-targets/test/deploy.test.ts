/**
 * @testenv-recycler-count 5
 */

import {
  executeDeployTargetsCommand,
  executeUndeployTargetsCommand,
} from "@takomo/test-integration"

const projectDir = "configs/simple"

describe("Deployment group commands", () => {
  test("Deploy single deployment group", () =>
    executeDeployTargetsCommand({
      projectDir,
      groups: ["Environments/Test"],
    })
      .expectCommandToSucceed()
      .expectResults({
        deploymentGroupPath: "Environments/Test",
        targetResults: [{ name: "five" }, { name: "four" }, { name: "three" }],
      })
      .assert())

  test("Deploy single target", () =>
    executeDeployTargetsCommand({
      projectDir,
      targets: ["two"],
    })
      .expectCommandToSucceed()
      .expectResults({
        deploymentGroupPath: "Environments/Dev",
        targetResults: [
          {
            name: "two",
            configSetResults: [
              {
                configSet: "logs",
                commandPathResults: [
                  {
                    commandPath: "/logs.yml",
                    stackResults: [
                      { stackPath: "/logs.yml/eu-west-1", stackName: "logs" },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      })
      .assert())

  test("Undeploy all", () =>
    executeUndeployTargetsCommand({
      projectDir,
    })
      .expectCommandToSucceed()
      .expectResults(
        {
          deploymentGroupPath: "Environments/Dev",
          targetResults: [{ name: "one", status: "SKIPPED" }, { name: "two" }],
        },
        {
          deploymentGroupPath: "Environments/Test",
          targetResults: [
            { name: "five" },
            { name: "four" },
            { name: "three" },
          ],
        },
      )
      .assert())

  test("Parallel deploy", () =>
    executeDeployTargetsCommand({
      projectDir,
      concurrentTargets: 3,
    })
      .expectCommandToSucceed()
      .expectResults(
        {
          deploymentGroupPath: "Environments/Dev",
          unorderedTargets: true,
          targetResults: [{ name: "one" }, { name: "two" }],
        },
        {
          deploymentGroupPath: "Environments/Test",
          unorderedTargets: true,
          targetResults: [
            { name: "five" },
            { name: "four" },
            { name: "three" },
          ],
        },
      )
      .assert())
})
