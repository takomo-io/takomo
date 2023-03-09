import {
  executeDeployStacksCommand,
  executeUndeployStacksCommand,
} from "../src/commands/stacks.js"

const projectDir = `${process.cwd()}/integration-test/configs/failing-stack`,
  stackPath = "/failure.yml/eu-west-1",
  stackName = "failure"

describe("Failing stack", () => {
  test("Deploy should fail", () =>
    executeDeployStacksCommand({
      projectDir,
      var: ["create_wait_condition=true", "terminationProtection=false"],
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
      var: ["create_wait_condition=false", "terminationProtection=false"],
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
      var: ["create_wait_condition=false", "terminationProtection=false"],
    })
      .expectCommandToSucceed()
      .expectStackDeleteSuccess({ stackName, stackPath })
      .assert())

  test("Deploy with termination protection should fail", () =>
    executeDeployStacksCommand({
      projectDir,
      var: ["create_wait_condition=true", "terminationProtection=true"],
    })
      .expectCommandToFail("Failed")
      .expectStackCreateFail({
        stackPath,
        stackName,
      })
      .assert())

  test("Deploying again with termination protection should succeed when the failing resources are not created", () =>
    executeDeployStacksCommand({
      projectDir,
      var: ["create_wait_condition=false", "terminationProtection=false"],
    })
      .expectCommandToSucceed()
      .expectStackCreateSuccess({
        stackName,
        stackPath,
      })
      .assert())
})
