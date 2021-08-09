import { AccountId, OrganizationFeatureSet, StackName } from "@takomo/aws-model"
import { ConfigSetName, ConfigSetStage } from "@takomo/config-sets"
import { CommandStatus } from "@takomo/core"
import {
  AccountsOperationOutput,
  CreateAccountAliasOutput,
  CreateOrganizationOutput,
  DeleteAccountAliasOutput,
  DeployOrganizationOutput,
  DescribeOrganizationOutput,
  ListAccountsOutput,
  OrganizationalUnitAccountsOperationResult,
} from "@takomo/organization-commands"
import { OrganizationalUnitPath } from "@takomo/organization-model"
import { CommandPath, StackPath } from "@takomo/stacks-model"

export interface CreateAccountAliasOutputMatcher {
  expectCommandToSucceed: () => CreateAccountAliasOutputMatcher
  assert: () => Promise<CreateAccountAliasOutput>
}

export const createCreateAccountAliasOutputMatcher = (
  executor: () => Promise<CreateAccountAliasOutput>,
  outputAssertions?: (output: CreateAccountAliasOutput) => void,
): CreateAccountAliasOutputMatcher => {
  const expectCommandToSucceed = () =>
    createCreateAccountAliasOutputMatcher(executor, (output) => {
      expect(output.status).toEqual("SUCCESS")
      expect(output.message).toEqual("Success")
      expect(output.success).toEqual(true)
      expect(output.error).toBeUndefined()
    })

  const assert = async (): Promise<CreateAccountAliasOutput> => {
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

export interface DeleteAccountAliasOutputMatcher {
  expectCommandToSucceed: () => DeleteAccountAliasOutputMatcher
  assert: () => Promise<DeleteAccountAliasOutput>
}

export const createDeleteAccountAliasOutputMatcher = (
  executor: () => Promise<DeleteAccountAliasOutput>,
  outputAssertions?: (output: DeleteAccountAliasOutput) => void,
): DeleteAccountAliasOutputMatcher => {
  const expectCommandToSucceed = () =>
    createDeleteAccountAliasOutputMatcher(executor, (output) => {
      expect(output.status).toEqual("SUCCESS")
      expect(output.message).toEqual("Success")
      expect(output.success).toEqual(true)
      expect(output.error).toBeUndefined()
    })

  const assert = async (): Promise<CreateAccountAliasOutput> => {
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

export interface DescribeOrganizationOutputMatcher {
  expectCommandToSucceed: () => DescribeOrganizationOutputMatcher
  assert: () => Promise<DescribeOrganizationOutput>
}

export const createDescribeOrganizationOutputMatcher = (
  executor: () => Promise<DescribeOrganizationOutput>,
  outputAssertions?: (output: DescribeOrganizationOutput) => void,
): DescribeOrganizationOutputMatcher => {
  const expectCommandToSucceed = () =>
    createDescribeOrganizationOutputMatcher(executor, (output) => {
      expect(output.status).toEqual("SUCCESS")
      expect(output.message).toEqual("Success")
      expect(output.success).toEqual(true)
      expect(output.error).toBeUndefined()
    })

  const assert = async (): Promise<DescribeOrganizationOutput> => {
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

interface ExpectCreateOrganizationOutputProps {
  readonly featureSet: OrganizationFeatureSet
  readonly masterAccountId: AccountId
}

export interface CreateOrganizationOutputMatcher {
  expectCommandToSucceed: () => CreateOrganizationOutputMatcher
  assert: (
    props: ExpectCreateOrganizationOutputProps,
  ) => Promise<CreateOrganizationOutput>
}

export const createCreateOrganizationOutputMatcher = (
  executor: () => Promise<CreateOrganizationOutput>,
  outputAssertions?: (output: CreateOrganizationOutput) => void,
): CreateOrganizationOutputMatcher => {
  const expectCommandToSucceed = () =>
    createCreateOrganizationOutputMatcher(executor, (output) => {
      expect(output.status).toEqual("SUCCESS")
      expect(output.message).toEqual("Success")
      expect(output.success).toEqual(true)
      expect(output.error).toBeUndefined()
    })

  const assert = async ({
    featureSet,
    masterAccountId,
  }: ExpectCreateOrganizationOutputProps): Promise<CreateOrganizationOutput> => {
    const output = await executor()
    if (outputAssertions) {
      outputAssertions(output)
    }

    expect(output.organization?.featureSet).toEqual(featureSet)
    expect(output.organization?.masterAccountId).toEqual(masterAccountId)

    return output
  }

  return {
    expectCommandToSucceed,
    assert,
  }
}

export interface ListAccountsOutputMatcher {
  expectCommandToSucceed: () => ListAccountsOutputMatcher
  assert: () => Promise<ListAccountsOutput>
}

export const createListAccountsOutputMatcher = (
  executor: () => Promise<ListAccountsOutput>,
  outputAssertions?: (output: ListAccountsOutput) => void,
): ListAccountsOutputMatcher => {
  const expectCommandToSucceed = () =>
    createListAccountsOutputMatcher(executor, (output) => {
      expect(output.status).toEqual("SUCCESS")
      expect(output.message).toEqual("Success")
      expect(output.success).toEqual(true)
      expect(output.error).toBeUndefined()
    })

  const assert = async (): Promise<ListAccountsOutput> => {
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
  readonly stage?: ConfigSetStage
  readonly accountResults: ReadonlyArray<ExpectAccountResultProps>
  // Do not require accounts to be in specified order
  readonly unorderedAccounts?: boolean
}

export interface AccountsOperationOutputMatcher {
  readonly expectCommandToSucceed: () => AccountsOperationOutputMatcher
  readonly expectResults: (
    ...props: ReadonlyArray<ExpectOrganizationalUnitResultProps>
  ) => AccountsOperationOutputMatcher
  readonly assert: () => Promise<AccountsOperationOutput>
}

type OrganizationalUnitResultAssertion = (
  result: OrganizationalUnitAccountsOperationResult,
) => boolean

interface CreateAccountsOperationOutputMatcherProps {
  readonly executor: () => Promise<AccountsOperationOutput>
  readonly outputAssertions?: (output: AccountsOperationOutput) => void
  readonly organizationalUnitAssertions: ReadonlyArray<OrganizationalUnitResultAssertion>
}

export const createAccountsOperationOutputMatcher = ({
  executor,
  outputAssertions,
  organizationalUnitAssertions,
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
      organizationalUnitAssertions: [],
    })
  }

  const expectResults = (
    ...props: ReadonlyArray<ExpectOrganizationalUnitResultProps>
  ): AccountsOperationOutputMatcher => {
    const assertions = props.map((prop) => {
      const assertion: OrganizationalUnitResultAssertion = (result) => {
        if (result.path !== prop.organizationalUnitPath) {
          return false
        }

        if (prop.stage) {
          expect(result.stage).toStrictEqual(prop.stage)
        }

        expect(result.results).toHaveLength(prop.accountResults.length)

        result.results.forEach((accountResult, i) => {
          const expected =
            prop.unorderedAccounts === true
              ? prop.accountResults.find(
                  (a) => a.accountId === accountResult.accountId,
                )
              : prop.accountResults[i]

          if (!expected) {
            fail(
              `Unexpected account ${accountResult.accountId} found under organizational unit ${result.path}`,
            )
          }

          expect(accountResult.accountId).toStrictEqual(expected.accountId)
          expect(accountResult.success).toStrictEqual(true)

          if (expected.status) {
            expect(accountResult.status).toStrictEqual(expected.status)
          } else {
            expect(accountResult.status).toStrictEqual("SUCCESS")
          }

          if (expected.configSetResults) {
            expect(accountResult.results).toHaveLength(
              expected.configSetResults.length,
            )

            accountResult.results.forEach((configSetResult, j) => {
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

    return createAccountsOperationOutputMatcher({
      executor,
      outputAssertions,
      organizationalUnitAssertions: [
        ...organizationalUnitAssertions,
        ...assertions,
      ],
    })
  }

  const assert = async (): Promise<AccountsOperationOutput> => {
    const output = await executor()
    if (outputAssertions) {
      outputAssertions(output)
    }

    expect(output.results).toHaveLength(organizationalUnitAssertions.length)
    if (!output.results) {
      fail("Expected output results to be defined")
    }

    output.results.forEach((result) => {
      if (!organizationalUnitAssertions.some((s) => s(result))) {
        fail(
          `Unexpected result for organizational unit result with path: ${result.path}`,
        )
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

export interface DeployOrganizationOutputMatcher {
  expectCommandToSucceed: () => DeployOrganizationOutputMatcher
  expectCommandToFail: (
    message: string,
    errorMessage?: string,
  ) => DeployOrganizationOutputMatcher
  expectCommandToThrow: (error: any) => Promise<void>
  expectCommandToThrowWithMessage: (message: string) => Promise<void>
  assert: () => Promise<DeployOrganizationOutput>
}

export const createDeployOrganizationOutputMatcher = (
  executor: () => Promise<DeployOrganizationOutput>,
  outputAssertions?: (output: DeployOrganizationOutput) => void,
): DeployOrganizationOutputMatcher => {
  const expectCommandToSucceed = () =>
    createDeployOrganizationOutputMatcher(executor, (output) => {
      expect(output.status).toEqual("SUCCESS")
      expect(output.message).toEqual("Success")
      expect(output.success).toEqual(true)
      expect(output.error).toBeUndefined()
    })

  const expectCommandToThrow = async (error: any): Promise<void> => {
    await expect(executor).rejects.toEqual(error)
  }

  const expectCommandToThrowWithMessage = async (
    message: string,
  ): Promise<void> => {
    await expect(executor).rejects.toThrow(message)
  }

  const expectCommandToFail = (message: string, errorMessage?: string) =>
    createDeployOrganizationOutputMatcher(executor, (output) => {
      expect(output.status).toEqual("FAILED")
      expect(output.message).toEqual(message)
      expect(output.success).toEqual(false)

      if (errorMessage) {
        expect(output.error?.message).toStrictEqual(errorMessage)
      } else {
        expect(output.error).toBeUndefined()
      }
    })

  const assert = async (): Promise<DeployOrganizationOutput> => {
    const output = await executor()
    if (outputAssertions) {
      outputAssertions(output)
    }

    return output
  }

  return {
    expectCommandToSucceed,
    expectCommandToFail,
    expectCommandToThrow,
    expectCommandToThrowWithMessage,
    assert,
  }
}
