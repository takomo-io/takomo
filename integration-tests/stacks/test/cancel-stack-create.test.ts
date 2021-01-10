import { executeDeployStacksCommand } from "@takomo/test-integration"

const projectDir = "configs/cancel-stack"

describe("Cancelling stack create", () => {
  test("Cancel deploy", () =>
    executeDeployStacksCommand({
      projectDir,
      autoConfirmEnabled: false,
    })
      .expectCommandToCancel()
      .assert())
})
