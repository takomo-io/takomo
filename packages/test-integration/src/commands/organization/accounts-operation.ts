import { AccountId, StackName } from "@takomo/aws-model"
import {
  ConfigSetName,
  StageExecutionResult,
  StageName,
} from "@takomo/config-sets"
import { CommandStatus } from "@takomo/core"
import { AccountsOperationOutput } from "@takomo/organization-commands"
import { OrganizationalUnitPath } from "@takomo/organization-model"
import { StacksOperationOutput } from "@takomo/stacks-commands"
import { CommandPath, StackPath } from "@takomo/stacks-model"

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

export interface ExpectAccountResultProps {
  readonly accountId: AccountId
  readonly status?: CommandStatus
  readonly configSetResults?: ReadonlyArray<ExpectConfigSetResultProps>
}

export interface ExpectOrganizationalUnitResultProps {
  readonly organizationalUnitPath: OrganizationalUnitPath
  readonly accountResults: ReadonlyArray<ExpectAccountResultProps>
}

export interface ExpectStageResultProps {
  readonly stageName: StageName
  readonly organizationalUnitResults: ReadonlyArray<ExpectOrganizationalUnitResultProps>
  // Do not require accounts to be in specified order
  readonly unorderedAccounts?: boolean
}

export interface AccountsOperationOutputMatcher {
  readonly expectCommandToSucceed: () => AccountsOperationOutputMatcher
  readonly expectResults: (
    ...props: ReadonlyArray<ExpectStageResultProps>
  ) => AccountsOperationOutputMatcher
  readonly assert: () => Promise<AccountsOperationOutput>
}

type StageResultAssertion = (
  result: StageExecutionResult<StacksOperationOutput>,
) => boolean

interface CreateAccountsOperationOutputMatcherProps {
  readonly executor: () => Promise<AccountsOperationOutput>
  readonly outputAssertions?: (output: AccountsOperationOutput) => void
  readonly stageAssertions: ReadonlyArray<StageResultAssertion>
}

export const createAccountsOperationOutputMatcher = ({
  executor,
  outputAssertions,
  stageAssertions,
}: CreateAccountsOperationOutputMatcherProps): AccountsOperationOutputMatcher => {
  const expectCommandToSucceed = () => {
    const assertions = (output: AccountsOperationOutput) => {
      expect(output.status).toEqual("SUCCESS")
      expect(output.message).toEqual("Success")
      expect(output.success).toEqual(true)
      expect(output.error).toBeUndefined()
    }

    return createAccountsOperationOutputMatcher({
      executor,
      outputAssertions: assertions,
      stageAssertions: [],
    })
  }

  const expectResults = (
    ...props: ReadonlyArray<ExpectStageResultProps>
  ): AccountsOperationOutputMatcher => {
    const assertions = props.map((prop) => {
      const assertion: StageResultAssertion = (stageResult) => {
        if (stageResult.stageName !== prop.stageName) {
          return false
        }

        expect(stageResult.results).toHaveLength(
          prop.organizationalUnitResults.length,
        )

        prop.organizationalUnitResults.forEach((expectedOuResult, ouIndex) => {
          const ouResult = stageResult.results[ouIndex]
          expect(ouResult.success).toStrictEqual(true)
          expect(ouResult.results).toHaveLength(
            expectedOuResult.accountResults.length,
          )

          expectedOuResult.accountResults.forEach(
            (expectedAccountResult, accountIndex) => {
              const actualAccountResult =
                prop.unorderedAccounts === true
                  ? ouResult.results.find(
                      (a) => a.targetId === expectedAccountResult.accountId,
                    )
                  : ouResult.results[accountIndex]

              if (!actualAccountResult) {
                fail(
                  `Expected account ${expectedAccountResult.accountId} to be found under organizational unit ${expectedOuResult.organizationalUnitPath}`,
                )
              }

              expect(actualAccountResult.targetId).toStrictEqual(
                expectedAccountResult.accountId,
              )
              expect(actualAccountResult.success).toStrictEqual(true)

              if (expectedAccountResult.status) {
                expect(actualAccountResult.status).toStrictEqual(
                  expectedAccountResult.status,
                )
              } else {
                expect(actualAccountResult.status).toStrictEqual("SUCCESS")
              }

              if (expectedAccountResult.configSetResults) {
                expect(actualAccountResult.results).toHaveLength(
                  expectedAccountResult.configSetResults.length,
                )

                expectedAccountResult.configSetResults.forEach(
                  (expectedConfigSetResult, j) => {
                    const actualConfigSetResult =
                      actualAccountResult.results![j]
                    expect(actualConfigSetResult.configSetName).toStrictEqual(
                      expectedConfigSetResult.configSet,
                    )

                    if (expectedConfigSetResult.commandPathResults) {
                      expect(actualConfigSetResult.results).toHaveLength(
                        expectedConfigSetResult.commandPathResults.length,
                      )

                      expectedConfigSetResult.commandPathResults.forEach(
                        (expectedCommandPathResult, k) => {
                          const actualCommandPathResult =
                            actualConfigSetResult.results![k]

                          expect(
                            actualCommandPathResult.commandPath,
                          ).toStrictEqual(expectedCommandPathResult.commandPath)

                          if (expectedCommandPathResult.stackResults) {
                            expect(
                              actualCommandPathResult.result.results,
                            ).toHaveLength(
                              expectedCommandPathResult.stackResults.length,
                            )

                            expectedCommandPathResult.stackResults.forEach(
                              (expectedStackResult, n) => {
                                const actualStackResult =
                                  actualCommandPathResult.result.results![n]

                                expect(
                                  actualStackResult.stack.path,
                                ).toStrictEqual(expectedStackResult.stackPath)
                                expect(
                                  actualStackResult.stack.name,
                                ).toStrictEqual(expectedStackResult.stackName)
                              },
                            )
                          }
                        },
                      )
                    }
                  },
                )
              }
            },
          )
        })

        return true
      }

      return assertion
    })

    return createAccountsOperationOutputMatcher({
      executor,
      outputAssertions,
      stageAssertions: [...stageAssertions, ...assertions],
    })
  }

  const assert = async (): Promise<AccountsOperationOutput> => {
    const output = await executor()
    if (outputAssertions) {
      outputAssertions(output)
    }

    expect(output.results).toHaveLength(stageAssertions.length)
    if (!output.results) {
      fail("Expected output results to be defined")
    }

    output.results.forEach((result) => {
      if (!stageAssertions.some((s) => s(result))) {
        fail(`Unexpected result for stage with name: ${result.stageName}`)
      }
    })

    return output
  }

  return {
    expectCommandToSucceed,
    expectResults,
    assert,
  }
}
