import { executeDeployTargetsCommand } from "@takomo/test-integration/src"

const projectDir = "configs/expect-no-changes"

describe("Expect no changes", () => {
  test("First deploy fails", () =>
    executeDeployTargetsCommand({
      projectDir,
      expectNoChanges: true,
      var: ["template=a.yml"],
    })
      .expectCommandToFail()
      .expectResults({
        deploymentGroupPath: "Default",
        targetResults: [
          {
            name: "example",
            status: "FAILED",
            success: false,
            configSetResults: [
              {
                configSet: "super",
                commandPathResults: [
                  {
                    commandPath: "/",
                    stackResults: [
                      {
                        stackPath: "/my-stack.yml/eu-north-1",
                        stackName: "my-stack",
                        success: false,
                        status: "FAILED",
                        message: "Stack has unexpected changes",
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

  test("Deploy again but expect changes", () =>
    executeDeployTargetsCommand({
      projectDir,
      var: ["template=a.yml"],
    })
      .expectCommandToSucceed()
      .expectResults({
        deploymentGroupPath: "Default",
        targetResults: [
          {
            name: "example",
            status: "SUCCESS",
            success: true,
            configSetResults: [
              {
                configSet: "super",
                commandPathResults: [
                  {
                    commandPath: "/",
                    stackResults: [
                      {
                        stackPath: "/my-stack.yml/eu-north-1",
                        stackName: "my-stack",
                        success: true,
                        status: "SUCCESS",
                        message: "Stack create succeeded",
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

  test("Deploy again without changes", () =>
    executeDeployTargetsCommand({
      projectDir,
      var: ["template=a.yml"],
      expectNoChanges: true,
    })
      .expectCommandToSucceed()
      .expectResults({
        deploymentGroupPath: "Default",
        targetResults: [
          {
            name: "example",
            status: "SUCCESS",
            success: true,
            configSetResults: [
              {
                configSet: "super",
                commandPathResults: [
                  {
                    commandPath: "/",
                    stackResults: [
                      {
                        stackPath: "/my-stack.yml/eu-north-1",
                        stackName: "my-stack",
                        success: true,
                        status: "SUCCESS",
                        message: "No changes",
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

  test("Update but expect no changes", () =>
    executeDeployTargetsCommand({
      projectDir,
      expectNoChanges: true,
      var: ["template=b.yml"],
    })
      .expectCommandToFail()
      .expectResults({
        deploymentGroupPath: "Default",
        targetResults: [
          {
            name: "example",
            status: "FAILED",
            success: false,
            configSetResults: [
              {
                configSet: "super",
                commandPathResults: [
                  {
                    commandPath: "/",
                    stackResults: [
                      {
                        stackPath: "/my-stack.yml/eu-north-1",
                        stackName: "my-stack",
                        success: false,
                        status: "FAILED",
                        message: "Stack has unexpected changes",
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
