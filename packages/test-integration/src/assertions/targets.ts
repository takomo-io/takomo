import { DeploymentTargetsOperationOutput } from "@takomo/deployment-targets-commands"

export interface TargetsOperationOutputMatcher {
  expectCommandToSucceed: () => TargetsOperationOutputMatcher
  assert: () => Promise<DeploymentTargetsOperationOutput>
}

export const createTargetsOperationOutputMatcher = (
  executor: () => Promise<DeploymentTargetsOperationOutput>,
  outputAssertions?: (output: DeploymentTargetsOperationOutput) => void,
): TargetsOperationOutputMatcher => {
  const expectCommandToSucceed = () =>
    createTargetsOperationOutputMatcher(executor, (output) => {
      expect(output.status).toEqual("SUCCESS")
      expect(output.message).toEqual("Success")
      expect(output.success).toEqual(true)
      expect(output.error).toBeUndefined()
    })

  const assert = async (): Promise<DeploymentTargetsOperationOutput> => {
    const output = await executor()
    if (outputAssertions) {
      outputAssertions(output)
    }

    return output
  }

  return {
    expectCommandToSucceed,
    assert,
  }
}
