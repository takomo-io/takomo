/**
 * @testenv-recycler-count 3
 */

import { executeDeployTargetsCommand } from "../../src/commands/targets/deploy-targets.js"
import { withReservation } from "../../src/reservations.js"

const projectDir = `${process.cwd()}/integration-test/configs/deployment-targets/variables`

describe("Variables", () => {
  test(
    "Should be used correctly",
    withReservation(() =>
      executeDeployTargetsCommand({
        projectDir,
        concurrentTargets: 3,
      })
        .expectCommandToSucceed()
        .expectResults(
          {
            deploymentGroupPath: "Environments/Dev",
            unorderedTargets: true,
            targetResults: [
              {
                name: "one",
                configSetResults: [
                  {
                    configSet: "super",
                    commandPathResults: [
                      {
                        commandPath: "/",
                        stackResults: [
                          {
                            stackPath: "/app.yml/eu-north-1",
                            stackName: "app",
                            tags: { color: "red", name: "hello" },
                            outputs: {
                              DeploymentGroupName: "Dev",
                              DeploymentGroupPath: "Environments/Dev",
                              TargetName: "one",
                            },
                          },
                        ],
                      },
                    ],
                  },
                ],
              },
              {
                name: "two",
                configSetResults: [
                  {
                    configSet: "super",
                    commandPathResults: [
                      {
                        commandPath: "/",
                        stackResults: [
                          {
                            stackPath: "/app.yml/eu-north-1",
                            stackName: "app",
                            tags: { color: "green", name: "hello" },
                            outputs: {
                              DeploymentGroupName: "Dev",
                              DeploymentGroupPath: "Environments/Dev",
                              TargetName: "two",
                            },
                          },
                        ],
                      },
                    ],
                  },
                ],
              },
            ],
          },
          {
            deploymentGroupPath: "Environments/Test",
            targetResults: [
              {
                name: "three",
                configSetResults: [
                  {
                    configSet: "super",
                    commandPathResults: [
                      {
                        commandPath: "/",
                        stackResults: [
                          {
                            stackPath: "/app.yml/eu-north-1",
                            stackName: "app",
                            tags: { color: "blue", name: "last" },
                            outputs: {
                              DeploymentGroupName: "Test",
                              DeploymentGroupPath: "Environments/Test",
                              TargetName: "three",
                            },
                          },
                        ],
                      },
                    ],
                  },
                ],
              },
            ],
          },
        )
        .assert(),
    ),
  )
})
