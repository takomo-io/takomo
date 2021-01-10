import {
  executeDeployStacksCommand,
  executeUndeployStacksCommand,
} from "@takomo/test-integration"

const projectDir = "configs/failing-stack",
  stackPath = "/failure.yml/eu-west-1",
  stackName = "failure"

describe("Failing stack", () => {
  test("Deploy should fail", () =>
    executeDeployStacksCommand({
      projectDir,
      var: ["create_wait_condition=true"],
    })
      .expectCommandToFail("Failed")
      .expectStackCreateFail({
        stackPath,
        stackName,
      })
      .assert())

  test("Deploying again should succeed when the failing resources are not created", () =>
    executeDeployStacksCommand({
      projectDir,
      var: ["create_wait_condition=false"],
    })
      .expectCommandToSucceed()
      .expectStackCreateSuccess({
        stackName,
        stackPath,
      })
      .assert())

  test("Undeploy", () =>
    executeUndeployStacksCommand({
      projectDir,
      var: ["create_wait_condition=false"],
    })
      .expectCommandToSucceed()
      .expectStackDeleteSuccess({ stackName, stackPath })
      .assert())
})
