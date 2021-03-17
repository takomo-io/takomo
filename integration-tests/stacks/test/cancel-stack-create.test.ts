import { ROOT_STACK_GROUP_PATH } from "@takomo/stacks-model"
import { executeDeployStacksCommand } from "@takomo/test-integration"

const projectDir = "configs/cancel-stack"

describe("Cancelling stack create", () => {
  test("Cancel deploy", () =>
    executeDeployStacksCommand({
      projectDir,
      autoConfirmEnabled: false,
      answers: {
        confirmStackDeploy: "CANCEL",
        confirmDeploy: "CANCEL",
        chooseCommandPath: ROOT_STACK_GROUP_PATH,
      },
    })
      .expectCommandToCancel()
      .assert())
})
