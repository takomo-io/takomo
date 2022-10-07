import {
  executeDeployStacksCommand,
  executeUndeployStacksCommand,
} from "../src/commands/stacks"

const stackName = "users",
  stackPath = "/users.yml/eu-central-1",
  projectDir = `${process.cwd()}/integration-test/configs/helpers`

describe("Helpers", () => {
  test("Deploy", () =>
    executeDeployStacksCommand({ projectDir })
      .expectCommandToSucceed()
      .expectStackCreateSuccess({
        stackName,
        stackPath,
      })
      .assert())

  test("Undeploy", () =>
    executeUndeployStacksCommand({ projectDir })
      .expectCommandToSucceed()
      .expectStackDeleteSuccess({
        stackName,
        stackPath,
      })
      .assert())
})
