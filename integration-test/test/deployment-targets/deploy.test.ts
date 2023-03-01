/**
 * @testenv-recycler-count 5
 */

import {
  stackCreateSucceeded,
  stackDeleteSucceeded,
} from "../../src/commands/common.js"
import { executeDeployTargetsCommand } from "../../src/commands/targets/deploy-targets.js"
import { executeUndeployTargetsCommand } from "../../src/commands/targets/undeploy-targets.js"

const projectDir = `${process.cwd()}/integration-test/configs/deployment-targets/simple`

describe("Deployment group commands", () => {
  test("Deploy single deployment group", () =>
    executeDeployTargetsCommand({
      projectDir,
      groups: ["Environments/Test"],
    })
      .expectCommandToSucceed()
      .expectResults({
        deploymentGroupPath: "Environments/Test",
        targetResults: [
          {
            name: "five",
            configSetResults: [
              {
                configSet: "logs",
                commandPathResults: [
                  {
                    commandPath: "/logs.yml",
                    stackResults: [
                      stackCreateSucceeded({
                        stackPath: "/logs.yml/eu-west-1",
                        stackName: "logs",
                      }),
                    ],
                  },
                ],
              },
            ],
          },
          {
            name: "four",
            configSetResults: [
              {
                configSet: "logs",
                commandPathResults: [
                  {
                    commandPath: "/logs.yml",
                    stackResults: [
                      stackCreateSucceeded({
                        stackPath: "/logs.yml/eu-west-1",
                        stackName: "logs",
                      }),
                    ],
                  },
                ],
              },
            ],
          },
          {
            name: "three",
            configSetResults: [
              {
                configSet: "logs",
                commandPathResults: [
                  {
                    commandPath: "/logs.yml",
                    stackResults: [
                      stackCreateSucceeded({
                        stackPath: "/logs.yml/eu-west-1",
                        stackName: "logs",
                      }),
                    ],
                  },
                ],
              },
            ],
          },
        ],
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
                      stackCreateSucceeded({
                        stackPath: "/logs.yml/eu-west-1",
                        stackName: "logs",
                      }),
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
          targetResults: [
            { name: "one", status: "SKIPPED" },
            {
              name: "two",
              status: "SUCCESS",
              configSetResults: [
                {
                  configSet: "logs",
                  commandPathResults: [
                    {
                      commandPath: "/logs.yml",
                      stackResults: [
                        stackDeleteSucceeded({
                          stackPath: "/logs.yml/eu-west-1",
                          stackName: "logs",
                        }),
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
              name: "five",
              configSetResults: [
                {
                  configSet: "logs",
                  commandPathResults: [
                    {
                      commandPath: "/logs.yml",
                      stackResults: [
                        stackDeleteSucceeded({
                          stackPath: "/logs.yml/eu-west-1",
                          stackName: "logs",
                        }),
                      ],
                    },
                  ],
                },
              ],
            },
            {
              name: "four",
              configSetResults: [
                {
                  configSet: "logs",
                  commandPathResults: [
                    {
                      commandPath: "/logs.yml",
                      stackResults: [
                        stackDeleteSucceeded({
                          stackPath: "/logs.yml/eu-west-1",
                          stackName: "logs",
                        }),
                      ],
                    },
                  ],
                },
              ],
            },
            {
              name: "three",
              configSetResults: [
                {
                  configSet: "logs",
                  commandPathResults: [
                    {
                      commandPath: "/logs.yml",
                      stackResults: [
                        stackDeleteSucceeded({
                          stackPath: "/logs.yml/eu-west-1",
                          stackName: "logs",
                        }),
                      ],
                    },
                  ],
                },
              ],
            },
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
