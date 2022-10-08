/**
 * @testenv-recycler-count 2
 */

import {
  executeDeployStacksCommand,
  executeUndeployStacksCommand,
} from "../../src/commands/stacks"

const projectDir = `${process.cwd()}/integration-test/configs/resolvers/external-stack-output`
const stacks = [
  {
    stackName: "account-a-stack1",
    stackPath: "/account-a/stack1.yml/us-east-1",
  },
  {
    stackName: "account-a-stack2",
    stackPath: "/account-a/stack2.yml/eu-west-1",
  },
  {
    stackName: "account-b-stack3",
    stackPath: "/account-b/stack3.yml/us-east-1",
  },
]

describe("External stack output resolver", () => {
  test("Deploy", () =>
    executeDeployStacksCommand({ projectDir })
      .expectCommandToSucceed()
      .expectStackCreateSuccess(...stacks)
      .assert())

  test("Undeploy", () =>
    executeUndeployStacksCommand({ projectDir })
      .expectCommandToSucceed()
      .expectStackDeleteSuccess(...stacks)
      .assert())
})
