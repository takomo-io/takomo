/**
 * Test reviewing of stacks.
 */

import { ROOT_STACK_GROUP_PATH } from "@takomo/stacks-model"
import { executeDeployStacksCommand } from "@takomo/test-integration"

const projectDir = "configs/review-stacks"

describe("Review stacks", () => {
  test("Deploy", () =>
    executeDeployStacksCommand({
      projectDir,
      var: ["configVersion=v1.yml"],
    })
      .expectCommandToSucceed()
      .expectStackCreateSuccess({
        stackName: "stack",
        stackPath: "/stack.yml/eu-north-1",
      })
      .assert())

  test("Deploy and review changes when parameters are added and removed", () =>
    executeDeployStacksCommand({
      projectDir,
      var: ["configVersion=v2.yml"],
      autoConfirmEnabled: false,
      answers: {
        confirmStackDeploy: "CONTINUE",
        confirmDeploy: "CONTINUE_AND_REVIEW",
        chooseCommandPath: ROOT_STACK_GROUP_PATH,
      },
    })
      .expectCommandToSucceed()
      .expectStackUpdateSuccess({
        stackName: "stack",
        stackPath: "/stack.yml/eu-north-1",
      })
      .assert())
})
