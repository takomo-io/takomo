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
      var: [
        "templateVersion=v1.yml",
        "paramsVersion=params/v1.yml",
        "tagsVersion=tags/v1.yml",
      ],
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
      var: [
        "templateVersion=v2.yml",
        "paramsVersion=params/v2.yml",
        "tagsVersion=tags/v2.yml",
      ],
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

  test("Deploy and review changes when tags are added and removed", () =>
    executeDeployStacksCommand({
      projectDir,
      var: [
        "templateVersion=v3.yml",
        "paramsVersion=params/v3.yml",
        "tagsVersion=tags/v3.yml",
      ],
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
