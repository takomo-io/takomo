/**
 * @testenv-recycler-count 2
 */

import {
  executeDeployStacksCommand,
  executeUndeployStacksCommand,
} from "@takomo/test-integration"

const projectDir = "configs/resolvers/external-stack-output"

describe("External stack output resolver", () => {
  test("Deploy", () =>
    executeDeployStacksCommand({ projectDir })
      .expectCommandToSucceed()
      .expectStackCreateSuccess({
        stackName: "account-a-stack1",
        stackPath: "/account-a/stack1.yml/us-east-1",
      })
      .expectStackCreateSuccess({
        stackName: "account-a-stack2",
        stackPath: "/account-a/stack2.yml/eu-west-1",
      })
      .expectStackCreateSuccess({
        stackName: "account-b-stack3",
        stackPath: "/account-b/stack3.yml/us-east-1",
      })
      .assert())

  test("Undeploy", () =>
    executeUndeployStacksCommand({ projectDir })
      .expectCommandToSucceed()
      .expectStackDeleteSuccess({
        stackName: "account-a-stack1",
        stackPath: "/account-a/stack1.yml/us-east-1",
      })
      .expectStackDeleteSuccess({
        stackName: "account-a-stack2",
        stackPath: "/account-a/stack2.yml/eu-west-1",
      })
      .expectStackDeleteSuccess({
        stackName: "account-b-stack3",
        stackPath: "/account-b/stack3.yml/us-east-1",
      })
      .assert())
})
