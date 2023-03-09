/**
 * Test choosing the command path interactively.
 */

import {
  executeDeployStacksCommand,
  executeUndeployStacksCommand,
} from "../src/commands/stacks.js"

const projectDir = `${process.cwd()}/integration-test/configs/interactive-command-paths`,
  interactive = true

describe("Choosing the command path interactively", () => {
  test("Deploying '/aaa/stack.yml' does not affect other stacks", () =>
    executeDeployStacksCommand({
      projectDir,
      interactive,
      answers: {
        chooseCommandPath: "/aaa/stack1.yml/eu-north-1",
        confirmDeploy: "CONTINUE_NO_REVIEW",
        confirmStackDeploy: "CONTINUE",
      },
    })
      .expectCommandToSucceed()
      .expectStackCreateSuccess({
        stackName: "aaa-stack1",
        stackPath: "/aaa/stack1.yml/eu-north-1",
      })
      .assert())

  test("Undeploying '/aaa/stack1.yml' does not affect other stacks", () =>
    executeUndeployStacksCommand({
      projectDir,
      interactive,
      answers: {
        chooseCommandPath: "/aaa/stack1.yml/eu-north-1",
        confirmUndeploy: "CONTINUE",
      },
    })
      .expectCommandToSucceed()
      .expectStackDeleteSuccess({
        stackName: "aaa-stack1",
        stackPath: "/aaa/stack1.yml/eu-north-1",
      })
      .assert())

  test("Deploying '/bbb/stack2.yml' deploys its dependencies", () =>
    executeDeployStacksCommand({
      projectDir,
      interactive,
      answers: {
        chooseCommandPath: "/bbb/stack2.yml/eu-north-1",
        confirmDeploy: "CONTINUE_NO_REVIEW",
        confirmStackDeploy: "CONTINUE",
      },
    })
      .expectCommandToSucceed()
      .expectStackCreateSuccess(
        {
          stackName: "bbb-stack2",
          stackPath: "/bbb/stack2.yml/eu-north-1",
        },
        {
          stackName: "stack3",
          stackPath: "/stack3.yml/eu-north-1",
        },
        {
          stackName: "stack4",
          stackPath: "/stack4.yml/eu-north-1",
        },
      )
      .assert())

  test("Undeploying '/bbb/stack4.yml' undeploys its dependencies", () =>
    executeUndeployStacksCommand({
      projectDir,
      interactive,
      answers: {
        chooseCommandPath: "/stack4.yml/eu-north-1",
        confirmUndeploy: "CONTINUE",
      },
    })
      .expectCommandToSucceed()
      .expectStackDeleteSuccess(
        {
          stackName: "bbb-stack2",
          stackPath: "/bbb/stack2.yml/eu-north-1",
        },
        {
          stackName: "stack3",
          stackPath: "/stack3.yml/eu-north-1",
        },
        {
          stackName: "stack4",
          stackPath: "/stack4.yml/eu-north-1",
        },
      )
      .assert())
})
