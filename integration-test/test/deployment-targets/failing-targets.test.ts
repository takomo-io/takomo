import { executeDeployTargetsCommand } from "../../src/commands/targets/deploy-targets"

const projectDir = `${process.cwd()}/integration-test/configs/deployment-targets/failing-targets`

describe("failing targets", () => {
  test("if a target fails the remaining targets should be cancelled", () =>
    executeDeployTargetsCommand({
      projectDir,
    })
      .expectCommandToFail()
      .expectResults({
        unorderedTargets: false,
        deploymentGroupPath: "application",
        targetResults: [
          {
            name: "aaa",
            status: "SUCCESS",
            success: true,
            configSetResults: [
              {
                configSet: "sample",
                commandPathResults: [
                  {
                    commandPath: "/",
                    stackResults: [
                      {
                        stackPath: "/sample.yml/eu-north-1",
                        stackName: "sample-aaa",
                        status: "SUCCESS",
                        success: true,
                      },
                    ],
                  },
                ],
              },
            ],
          },
          {
            name: "bbb",
            status: "FAILED",
            success: false,
            configSetResults: [
              {
                configSet: "sample",
                commandPathResults: [
                  {
                    commandPath: "/",
                    stackResults: [
                      {
                        stackPath: "/sample.yml/eu-north-1",
                        stackName: "sample-bbb",
                        status: "FAILED",
                        success: false,
                      },
                    ],
                  },
                ],
              },
            ],
          },
          {
            name: "ccc",
            status: "CANCELLED",
            success: false,
            configSetResults: [
              {
                configSet: "sample",
                commandPathResults: [
                  {
                    commandPath: "/",
                    stackResults: [],
                  },
                ],
              },
            ],
          },
          {
            name: "ddd",
            status: "CANCELLED",
            success: false,
            configSetResults: [
              {
                configSet: "sample",
                commandPathResults: [
                  {
                    commandPath: "/",
                    stackResults: [],
                  },
                ],
              },
            ],
          },
        ],
      })
      .assert())
})
