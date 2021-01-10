import { executeDeployStacksCommand } from "@takomo/test-integration"

const stackName = "params",
  stackPath = "/params.yml/eu-north-1",
  projectDir = "configs/immutable-parameters"

describe("Immutable parameters", () => {
  test("Parameter with NoEcho=true can't be marked as immutable", () =>
    executeDeployStacksCommand({
      projectDir,
      var: ["value1=a", "value2=b", "value3=c", "immutable3=true"],
    })
      .expectCommandToFail("Failed")
      .expectFailureStackResult({
        stackName,
        stackPath,
        message: "Error",
        errorMessage: `Invalid configuration in parameter 'Param3'. Parameter with NoEcho=true can't be marked as immutable.`,
      })
      .assert())

  test("Successful deploy", () =>
    executeDeployStacksCommand({
      projectDir,
      var: ["value1=a", "value2=b", "value3=c", "immutable3=false"],
    })
      .expectCommandToSucceed()
      .expectStackCreateSuccess({
        stackName,
        stackPath,
      })
      .assert())

  test("Updating immutable parameter fails", () =>
    executeDeployStacksCommand({
      projectDir,
      var: ["value1=a2", "value2=b", "value3=c", "immutable3=false"],
    })
      .expectCommandToFail("Failed")
      .expectFailureStackResult({
        stackName,
        stackPath,
        message: "Error",
        errorMessage: `Parameter 'Param1' is marked as immutable but deploying the stack would update its value.`,
      })
      .assert())
})
