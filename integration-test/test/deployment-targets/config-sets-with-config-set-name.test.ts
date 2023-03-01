/**
 * Test deploying config sets with config set name and command path options.
 */

import { executeDeployTargetsCommand } from "../../src/commands/targets/deploy-targets.js"

const projectDir = `${process.cwd()}/integration-test/configs/deployment-targets/config-sets-with-config-set-name`

describe("Deployment targets", () => {
  test("Deploy with config set name", () =>
    executeDeployTargetsCommand({
      projectDir,
      configSetName: "bbb",
    })
      .expectCommandToSucceed()
      .expectResults({
        deploymentGroupPath: "all",
        targetResults: [
          {
            name: "first",
            configSetResults: [
              {
                configSet: "bbb",
                commandPathResults: [
                  {
                    commandPath: "/",
                    stackResults: [
                      { stackPath: "/logs.yml/eu-north-1", stackName: "logs" },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      })
      .assert())

  test("Deploy with config set name and non-existing command path", () =>
    executeDeployTargetsCommand({
      projectDir,
      configSetName: "bbb",
      commandPath: "/trololoo",
    })
      .expectCommandToFail()
      .expectResults({
        deploymentGroupPath: "all",
        targetResults: [
          {
            name: "first",
            success: false,
            status: "FAILED",
            configSetResults: [
              {
                configSet: "bbb",
                commandPathResults: [
                  {
                    commandPath: "/trololoo",
                    message: "Failed",
                    stackResults: [],
                  },
                ],
              },
            ],
          },
        ],
      })
      .assert())

  test("Deploy with non-existing config set name", () =>
    executeDeployTargetsCommand({
      projectDir,
      configSetName: "invalid",
    }).expectCommandToThrow("Config set 'invalid' not found"))

  test("Deploy with config set name and command path", () =>
    executeDeployTargetsCommand({
      projectDir,
      configSetName: "aaa",
      commandPath: "/test",
    })
      .expectCommandToSucceed()
      .expectResults({
        deploymentGroupPath: "all",
        targetResults: [
          {
            name: "first",
            configSetResults: [
              {
                configSet: "aaa",
                commandPathResults: [
                  {
                    commandPath: "/test",
                    stackResults: [
                      {
                        stackPath: "/test/app.yml/eu-north-1",
                        stackName: "test-app",
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
