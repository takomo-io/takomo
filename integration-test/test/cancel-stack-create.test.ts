import { ROOT_STACK_GROUP_PATH } from "../../src/takomo-stacks-model/constants.js"
import { executeDeployStacksCommand } from "../src/commands/stacks.js"

const projectDir = `${process.cwd()}/integration-test/configs/cancel-stack`

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
