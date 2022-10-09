import { executeDeployStacksCommand } from "../src/commands/stacks"

const stackName = "params",
  stackPath = "/params.yml/eu-north-1",
  projectDir = `${process.cwd()}/integration-test/configs/immutable-parameters`

describe("Immutable parameters", () => {
  test("Parameter with NoEcho=true can't be marked as immutable", () =>
    executeDeployStacksCommand({
      projectDir,
      var: ["value1=a", "value2=b", "value3=c", "immutable3=true"],
    })
      .expectCommandToFail("Failed")
      .expectStackCreateFail({
        stackName,
        stackPath,
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
      .expectStackUpdateFail({
        stackName,
        stackPath,
        errorMessage: `Parameter 'Param1' is marked as immutable but deploying the stack would update its value.`,
      })
      .assert())
})
