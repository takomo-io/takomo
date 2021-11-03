import { StackName, Tag, TagKey, TagValue } from "@takomo/aws-model"
import { ConfigSetName } from "@takomo/config-sets"
import { CommandStatus } from "@takomo/core"
import { DeploymentTargetsOperationOutput } from "@takomo/deployment-targets-commands"
import {
  DeploymentGroupPath,
  DeploymentTargetName,
} from "@takomo/deployment-targets-model"
import { ConfigSetGroupExecutionResult } from "@takomo/execution-plans"
import { StacksOperationOutput } from "@takomo/stacks-commands"
import { CommandPath, StackPath } from "@takomo/stacks-model"
import { ExecuteCommandProps } from "../common"

export interface ExecuteDeployTargetsCommandProps extends ExecuteCommandProps {
  readonly groups?: ReadonlyArray<string>
  readonly targets?: ReadonlyArray<string>
  readonly excludeTargets?: ReadonlyArray<string>
  readonly labels?: ReadonlyArray<string>
  readonly excludeLabels?: ReadonlyArray<string>
  readonly configFile?: string
  readonly concurrentTargets?: number
  readonly commandPath?: CommandPath
  readonly configSetName?: ConfigSetName
  readonly expectNoChanges?: boolean
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
  readonly tags?: Record<TagKey, TagValue>
  readonly message?: string
  readonly success?: boolean
  readonly status?: CommandStatus
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
  result: ConfigSetGroupExecutionResult<StacksOperationOutput>,
) => Promise<boolean>

const createDeploymentGroupResultMatcher = (
  executor: () => Promise<DeploymentTargetsOperationOutput>,
  outputAssertions: (output: DeploymentTargetsOperationOutput) => void,
  groupsAssertions: ReadonlyArray<DeploymentGroupResultAssertion> = [],
): DeploymentGroupResultMatcher => {
  const expectResults = (
    ...props: ReadonlyArray<ExpectDeploymentGroupResultProps>
  ): DeploymentGroupResultMatcher => {
    const assertions = props.map((prop) => {
      const assertion: DeploymentGroupResultAssertion = async (
        result,
      ): Promise<boolean> => {
        if (result.groupId !== prop.deploymentGroupPath) {
          return false
        }

        expect(result.results).toHaveLength(prop.targetResults.length)

        for (const [i, targetResult] of result.results.entries()) {
          const expected =
            prop.unorderedTargets === true
              ? prop.targetResults.find((a) => a.name === targetResult.targetId)
              : prop.targetResults[i]

          if (!expected) {
            fail(
              `Unexpected target ${targetResult.targetId} found under deployment group ${result.groupId}`,
            )
          }

          expect(targetResult.targetId).toStrictEqual(expected.name)
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

            for (const [j, configSetResult] of targetResult.results.entries()) {
              const expectedConfigSetResult = expected.configSetResults![j]
              expect(configSetResult.configSetName).toStrictEqual(
                expectedConfigSetResult.configSet,
              )

              if (expectedConfigSetResult.commandPathResults) {
                expect(configSetResult.results).toHaveLength(
                  expectedConfigSetResult.commandPathResults.length,
                )

                for (const [
                  k,
                  commandPathResult,
                ] of configSetResult.results.entries()) {
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

                    for (const [
                      n,
                      stackResult,
                    ] of commandPathResult.result.results.entries()) {
                      const expectedStackResult =
                        expectedCommandPathResult.stackResults![n]

                      expect(stackResult.stack.path).toStrictEqual(
                        expectedStackResult.stackPath,
                      )
                      expect(stackResult.stack.name).toStrictEqual(
                        expectedStackResult.stackName,
                      )

                      if (expectedStackResult.message) {
                        expect(stackResult.message).toStrictEqual(
                          expectedStackResult.message,
                        )
                      }

                      if (expectedStackResult.success !== undefined) {
                        expect(stackResult.success).toStrictEqual(
                          expectedStackResult.success,
                        )
                      }

                      if (expectedStackResult.status) {
                        expect(stackResult.status).toStrictEqual(
                          expectedStackResult.status,
                        )
                      }

                      if (expectedStackResult.tags) {
                        const cfStack =
                          await stackResult.stack.getCurrentCloudFormationStack()

                        if (!cfStack) {
                          throw new Error(
                            `Expected stack '${expectedStackResult.stackPath}' to exists`,
                          )
                        }

                        const actual = cfStack.tags.reduce(
                          (collected: Record<TagKey, TagValue>, tag: Tag) => ({
                            ...collected,
                            [tag.key]: tag.value,
                          }),
                          {},
                        )

                        expect(actual).toStrictEqual(expectedStackResult.tags)
                      }
                    }
                  }
                }
              }
            }
          }
        }

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

    // TODO: Add support for stages
    for (const stage of output.results) {
      expect(stage.results).toHaveLength(groupsAssertions.length)
      for (const result of stage.results) {
        let res = false
        for (const groupAssertion of groupsAssertions) {
          res = await groupAssertion(result)
          if (res) {
            break
          }
        }

        if (!res) {
          fail(`Unexpected result for deployment group: ${result.groupId}`)
        }
      }
    }

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
