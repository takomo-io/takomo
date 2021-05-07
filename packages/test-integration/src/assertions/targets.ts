import { StackName } from "@takomo/aws-model"
import { ConfigSetName } from "@takomo/config-sets"
import { CommandStatus } from "@takomo/core"
import {
  DeploymentGroupDeployResult,
  DeploymentTargetsOperationOutput,
} from "@takomo/deployment-targets-commands"
import {
  DeploymentGroupPath,
  DeploymentTargetName,
} from "@takomo/deployment-targets-model"
import { CommandPath, StackPath } from "@takomo/stacks-model"

export interface TargetsOperationOutputMatcher {
  readonly expectCommandToSucceed: () => DeploymentGroupResultMatcher
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
}

export interface ExpectConfigSetResultProps {
  readonly configSet: ConfigSetName
  readonly commandPathResults?: ReadonlyArray<ExpectCommandPathResultProps>
}

export interface ExpectDeploymentTargetResultProps {
  readonly name: DeploymentTargetName
  readonly status?: CommandStatus
  readonly configSetResults?: ReadonlyArray<ExpectConfigSetResultProps>
}

export interface ExpectDeploymentGroupResultProps {
  readonly deploymentGroupPath: DeploymentGroupPath
  readonly targetResults: ReadonlyArray<ExpectDeploymentTargetResultProps>
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
          const expected = prop.targetResults[i]
          expect(targetResult.name).toStrictEqual(expected.name)
          expect(targetResult.success).toStrictEqual(true)
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
                  const expectedCommandPathResult = expectedConfigSetResult.commandPathResults![
                    k
                  ]

                  expect(commandPathResult.commandPath).toStrictEqual(
                    expectedCommandPathResult.commandPath,
                  )

                  if (expectedCommandPathResult.stackResults) {
                    expect(commandPathResult.result.results).toHaveLength(
                      expectedCommandPathResult.stackResults.length,
                    )

                    commandPathResult.result.results.forEach(
                      (stackResult, n) => {
                        const expectedStackResult = expectedCommandPathResult.stackResults![
                          n
                        ]

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

  const expectCommandToSkip = () =>
    createDeploymentGroupResultMatcher(executor, (output) => {
      expect(output.status).toEqual("SKIPPED")
      expect(output.message).toEqual("No targets to deploy")
      expect(output.success).toEqual(true)
      expect(output.error).toBeUndefined()
    })

  const expectCommandToThrow = async (error: any): Promise<void> => {
    await expect(executor).rejects.toEqual(error)
  }

  return {
    expectCommandToSucceed,
    expectCommandToSkip,
    expectCommandToThrow,
  }
}
