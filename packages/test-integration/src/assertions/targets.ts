import { DeploymentTargetsOperationOutput } from "@takomo/deployment-targets-commands"

export interface TargetsOperationOutputMatcher {
  expectCommandToSucceed: () => TargetsOperationOutputMatcher
  expectCommandToSkip: () => TargetsOperationOutputMatcher
  expectCommandToThrow: (error: any) => Promise<void>
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

  const expectCommandToSkip = () =>
    createTargetsOperationOutputMatcher(executor, (output) => {
      expect(output.status).toEqual("SKIPPED")
      expect(output.message).toEqual("No targets to deploy")
      expect(output.success).toEqual(true)
      expect(output.error).toBeUndefined()
    })

  const expectCommandToThrow = async (error: any): Promise<void> => {
    await expect(executor).rejects.toEqual(error)
  }

  const assert = async (): Promise<DeploymentTargetsOperationOutput> => {
    const output = await executor()
    if (outputAssertions) {
      outputAssertions(output)
    }

    return output
  }

  return {
    expectCommandToSucceed,
    expectCommandToSkip,
    expectCommandToThrow,
    assert,
  }
}
