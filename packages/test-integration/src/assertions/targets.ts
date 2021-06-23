import { StackName } from "@takomo/aws-model"
import { ConfigSetName } from "@takomo/config-sets"
import { CommandStatus } from "@takomo/core"
import {
  DeploymentGroupDeployResult,
  DeploymentTargetsOperationOutput,
  DeploymentTargetsRunOutput,
} from "@takomo/deployment-targets-commands"
import {
  DeploymentGroupPath,
  DeploymentTargetName,
} from "@takomo/deployment-targets-model"
import { CommandPath, StackPath } from "@takomo/stacks-model"

export interface TargetsRunOutputMatcher {
  readonly expectCommandToSucceed: (
    expectedResult: unknown,
  ) => TargetsRunOutputMatcher
  readonly assert: () => Promise<DeploymentTargetsRunOutput>
}
export interface TargetsOperationOutputMatcher {
  readonly expectCommandToSucceed: () => DeploymentGroupResultMatcher
  readonly expectCommandToFail: () => DeploymentGroupResultMatcher
  readonly expectCommandToSkip: () => DeploymentGroupResultMatcher
  readonly expectCommandToThrow: (error: any) => Promise<void>
}

export interface ExpectStackResultProps {
  readonly stackPath: StackPath
  readonly stackName: StackName
}

export interface ExpectCommandPathResultProps {
  readonly commandPath: CommandPath
  readonly stackResults?: ReadonlyArray<ExpectStackResultProps>
  readonly message?: string
}

export interface ExpectConfigSetResultProps {
  readonly configSet: ConfigSetName
  readonly commandPathResults?: ReadonlyArray<ExpectCommandPathResultProps>
}

export interface ExpectDeploymentTargetResultProps {
  readonly name: DeploymentTargetName
  readonly status?: CommandStatus
  readonly success?: boolean
  readonly configSetResults?: ReadonlyArray<ExpectConfigSetResultProps>
}

export interface ExpectDeploymentGroupResultProps {
  readonly deploymentGroupPath: DeploymentGroupPath
  readonly targetResults: ReadonlyArray<ExpectDeploymentTargetResultProps>
  readonly unorderedTargets?: boolean
}

export interface DeploymentGroupResultMatcher {
  readonly expectResults: (
    ...props: ReadonlyArray<ExpectDeploymentGroupResultProps>
  ) => DeploymentGroupResultMatcher
  readonly assert: () => Promise<DeploymentTargetsOperationOutput>
}

type DeploymentGroupResultAssertion = (
  result: DeploymentGroupDeployResult,
) => boolean

const createDeploymentGroupResultMatcher = (
  executor: () => Promise<DeploymentTargetsOperationOutput>,
  outputAssertions: (output: DeploymentTargetsOperationOutput) => void,
  groupsAssertions: ReadonlyArray<DeploymentGroupResultAssertion> = [],
): DeploymentGroupResultMatcher => {
  const expectResults = (
    ...props: ReadonlyArray<ExpectDeploymentGroupResultProps>
  ): DeploymentGroupResultMatcher => {
    const assertions = props.map((prop) => {
      const assertion: DeploymentGroupResultAssertion = (result) => {
        if (result.path !== prop.deploymentGroupPath) {
          return false
        }

        expect(result.results).toHaveLength(prop.targetResults.length)
        result.results.forEach((targetResult, i) => {
          const expected =
            prop.unorderedTargets === true
              ? prop.targetResults.find((a) => a.name === targetResult.name)
              : prop.targetResults[i]

          if (!expected) {
            fail(
              `Unexpected target ${targetResult.name} found under deployment group ${result.path}`,
            )
          }

          expect(targetResult.name).toStrictEqual(expected.name)
          if (expected.success !== undefined) {
            expect(targetResult.success).toStrictEqual(expected.success)
          } else {
            expect(targetResult.success).toStrictEqual(true)
          }

          if (expected.status) {
            expect(targetResult.status).toStrictEqual(expected.status)
          } else {
            expect(targetResult.status).toStrictEqual("SUCCESS")
          }

          if (expected.configSetResults) {
            expect(targetResult.results).toHaveLength(
              expected.configSetResults.length,
            )

            targetResult.results.forEach((configSetResult, j) => {
              const expectedConfigSetResult = expected.configSetResults![j]
              expect(configSetResult.configSetName).toStrictEqual(
                expectedConfigSetResult.configSet,
              )

              if (expectedConfigSetResult.commandPathResults) {
                expect(configSetResult.results).toHaveLength(
                  expectedConfigSetResult.commandPathResults.length,
                )

                configSetResult.results.forEach((commandPathResult, k) => {
                  const expectedCommandPathResult =
                    expectedConfigSetResult.commandPathResults![k]

                  expect(commandPathResult.commandPath).toStrictEqual(
                    expectedCommandPathResult.commandPath,
                  )

                  if (expectedCommandPathResult.message) {
                    expect(commandPathResult.message).toStrictEqual(
                      expectedCommandPathResult.message,
                    )
                  }

                  if (expectedCommandPathResult.stackResults) {
                    expect(commandPathResult.result.results).toHaveLength(
                      expectedCommandPathResult.stackResults.length,
                    )

                    commandPathResult.result.results.forEach(
                      (stackResult, n) => {
                        const expectedStackResult =
                          expectedCommandPathResult.stackResults![n]

                        expect(stackResult.stack.path).toStrictEqual(
                          expectedStackResult.stackPath,
                        )
                        expect(stackResult.stack.name).toStrictEqual(
                          expectedStackResult.stackName,
                        )
                      },
                    )
                  }
                })
              }
            })
          }
        })

        return true
      }

      return assertion
    })

    return createDeploymentGroupResultMatcher(executor, outputAssertions, [
      ...groupsAssertions,
      ...assertions,
    ])
  }

  const assert = async (): Promise<DeploymentTargetsOperationOutput> => {
    const output = await executor()
    if (outputAssertions) {
      outputAssertions(output)
    }

    expect(output.results).toHaveLength(groupsAssertions.length)
    output.results.forEach((result) => {
      if (!groupsAssertions.some((s) => s(result))) {
        fail(
          `Unexpected result for deployment group result with path: ${result.path}`,
        )
      }
    })

    return output
  }

  return {
    assert,
    expectResults,
  }
}

export const createTargetsOperationOutputMatcher = (
  executor: () => Promise<DeploymentTargetsOperationOutput>,
): TargetsOperationOutputMatcher => {
  const expectCommandToSucceed = () =>
    createDeploymentGroupResultMatcher(executor, (output) => {
      expect(output.status).toEqual("SUCCESS")
      expect(output.message).toEqual("Success")
      expect(output.success).toEqual(true)
      expect(output.error).toBeUndefined()
    })

  const expectCommandToFail = () =>
    createDeploymentGroupResultMatcher(executor, (output) => {
      expect(output.status).toEqual("FAILED")
      expect(output.message).toEqual("Failed")
      expect(output.success).toEqual(false)
      expect(output.error).toBeUndefined()
    })

  const expectCommandToSkip = () =>
    createDeploymentGroupResultMatcher(executor, (output) => {
      expect(output.status).toEqual("SKIPPED")
      expect(output.message).toEqual("No targets to deploy")
      expect(output.success).toEqual(true)
      expect(output.error).toBeUndefined()
    })

  const expectCommandToThrow = async (error: any): Promise<void> => {
    if (typeof error === "string") {
      await expect(executor).rejects.toThrow(error)
    } else {
      await expect(executor).rejects.toEqual(error)
    }
  }

  return {
    expectCommandToSucceed,
    expectCommandToFail,
    expectCommandToSkip,
    expectCommandToThrow,
  }
}

export const createTargetsRunOutputMatcher = (
  executor: () => Promise<DeploymentTargetsRunOutput>,
  outputAssertions?: (output: DeploymentTargetsRunOutput) => void,
): TargetsRunOutputMatcher => {
  const expectCommandToSucceed = (expectedResult: unknown) =>
    createTargetsRunOutputMatcher(executor, (output) => {
      expect(output.status).toEqual("SUCCESS")
      expect(output.message).toEqual("Success")
      expect(output.success).toEqual(true)
      expect(output.error).toBeUndefined()

      if (typeof expectedResult === "function") {
        expectedResult(output.result)
      } else {
        expect(output.result).toStrictEqual(expectedResult)
      }
    })

  const assert = async (): Promise<DeploymentTargetsRunOutput> => {
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
