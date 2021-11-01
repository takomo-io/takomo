/**
 * Test config sets.
 *
 * @testenv-recycler-count 4
 */

import {
  executeDeployTargetsCommand,
  stackCreateSucceeded,
} from "@takomo/test-integration"

const projectDir = "configs/config-sets"

describe("Config sets", () => {
  test("Legacy config sets", () =>
    executeDeployTargetsCommand({
      projectDir,
      groups: ["application"],
    })
      .expectCommandToSucceed()
      .expectResults({
        deploymentGroupPath: "application",
        targetResults: [
          {
            name: "app1",
            configSetResults: [
              {
                configSet: "legacyAll",
                commandPathResults: [
                  {
                    commandPath: "/",
                    stackResults: [
                      stackCreateSucceeded({
                        stackPath: "/a.yml/eu-west-1",
                        stackName: "a",
                      }),
                      stackCreateSucceeded({
                        stackPath: "/b.yml/eu-west-1",
                        stackName: "b",
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

  test("Legacy config sets with single command path", () =>
    executeDeployTargetsCommand({
      projectDir,
      groups: ["infra"],
    })
      .expectCommandToSucceed()
      .expectResults({
        deploymentGroupPath: "infra",
        targetResults: [
          {
            name: "infra1",
            configSetResults: [
              {
                configSet: "legacySingle",
                commandPathResults: [
                  {
                    commandPath: "/a.yml",
                    stackResults: [
                      {
                        stackPath: "/a.yml/eu-west-1",
                        stackName: "a",
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      })
      .assert())

  test("New config sets", () =>
    executeDeployTargetsCommand({
      projectDir,
      groups: ["common"],
    })
      .expectCommandToSucceed()
      .expectResults({
        deploymentGroupPath: "common",
        targetResults: [
          {
            name: "common1",
            configSetResults: [
              {
                configSet: "logs",
                commandPathResults: [
                  {
                    commandPath: "/",
                    stackResults: [
                      {
                        stackPath: "/logs.yml/eu-west-1",
                        stackName: "logs",
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      })
      .assert())

  test("New config set with extra configuration", () =>
    executeDeployTargetsCommand({
      projectDir,
      groups: ["security"],
    })
      .expectCommandToSucceed()
      .expectResults({
        deploymentGroupPath: "security",
        targetResults: [
          {
            name: "security1",
            configSetResults: [
              {
                configSet: "network",
                commandPathResults: [
                  {
                    commandPath: "/network2.yml",
                    stackResults: [
                      {
                        stackPath: "/network2.yml/eu-west-1",
                        stackName: "network2",
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      })
      .assert())
})
