import { mock } from "jest-mock-extended"
import { getNativeDeploymentConfig } from "../../../../../../src/command/stacks/deploy/standard-stack/steps/util.js"
import { InternalStandardStack } from "../../../../../../src/stacks/standard-stack.js"

const stackWith = (
  deploymentConfig: InternalStandardStack["deploymentConfig"],
): InternalStandardStack => mock<InternalStandardStack>({ deploymentConfig })

describe("#getNativeDeploymentConfig", () => {
  test("standard mode", () => {
    expect(
      getNativeDeploymentConfig(
        stackWith({ mode: "STANDARD", disableRollback: false }),
      ),
    ).toStrictEqual({ Mode: "STANDARD", DisableRollback: false })
  })

  test("express mode with rollback disabled", () => {
    expect(
      getNativeDeploymentConfig(
        stackWith({ mode: "EXPRESS", disableRollback: true }),
      ),
    ).toStrictEqual({ Mode: "EXPRESS", DisableRollback: true })
  })
})
