/**
 * @testenv-recycler-count 3
 */

import {
  executeDeployStacksCommand,
  executeUndeployStacksCommand,
} from "../../src/commands/stacks.js"

const projectDir = `${process.cwd()}/integration-test/configs/resolvers/external-stack-output-with-cache`
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
  {
    stackName: "account-b-stack5",
    stackPath: "/account-b/stack5.yml/us-east-1",
  },
  {
    stackName: "account-c-stack4",
    stackPath: "/account-c/stack4.yml/eu-north-1",
  },
]

describe("External stack output resolver with cache", () => {
  test("Deploy", () =>
    executeDeployStacksCommand({ projectDir, logLevel: "debug" })
      .expectCommandToSucceed()
      .expectStackCreateSuccess(...stacks)
      .assert())

  test("Undeploy", () =>
    executeUndeployStacksCommand({ projectDir })
      .expectCommandToSucceed()
      .expectStackDeleteSuccess(...stacks)
      .assert())
})
