import {
  executeDeployStacksCommand,
  executeUndeployStacksCommand,
} from "@takomo/test-integration"

const projectDir = "configs/timeout",
  stackName = "timeout",
  stackPath = "/timeout.yml/eu-north-1"

describe("Timeout", () => {
  test("Deploy should fail due timeout", () =>
    executeDeployStacksCommand({
      projectDir,
      var: ["create_wait_condition=true", "create_second_topic=false"],
    })
      .expectCommandToFail("Failed")
      .expectStackCreateFail({
        stackName,
        stackPath,
      })
      .assert())

  test("Deploying again should succeed when the failing resources are not created", () =>
    executeDeployStacksCommand({
      projectDir,
      var: ["create_wait_condition=false", "create_second_topic=false"],
    })
      .expectCommandToSucceed()
      .expectStackCreateSuccess({
        stackName,
        stackPath,
      })
      .assert())

  test("Deploying should fail due timeout", () =>
    executeDeployStacksCommand({
      projectDir,
      var: ["create_wait_condition=true", "create_second_topic=true"],
    })
      .expectCommandToFail("Failed")
      .expectStackUpdateFail({
        stackName,
        stackPath,
      })
      .assert())

  test("Deploying stack again should succeed when the failing resources are not created", () =>
    executeDeployStacksCommand({
      projectDir,
      var: ["create_wait_condition=false", "create_second_topic=true"],
    })
      .expectCommandToSucceed()
      .expectStackUpdateSuccess({
        stackName,
        stackPath,
      })
      .assert())

  test("Undeploy", () =>
    executeUndeployStacksCommand({
      projectDir,
      var: ["create_wait_condition=false", "create_second_topic=true"],
    })
      .expectCommandToSucceed()
      .expectStackDeleteSuccess({
        stackName,
        stackPath,
      })
      .assert())
})
