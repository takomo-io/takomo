import { AccountId, StackName } from "@takomo/aws-model"
import { ConfigSetName, StageName } from "@takomo/config-sets"
import { CommandStatus, ResultsOutput } from "@takomo/core"
import {
  CommandPathExecutionResult,
  ConfigSetExecutionResult,
  GroupExecutionResult,
  PlanExecutionResult,
  StageExecutionResult,
  TargetExecutionResult,
} from "@takomo/execution-plans"
import { OrganizationalUnitPath } from "@takomo/organization-model"
import { CommandPath, StackPath, StackResult } from "@takomo/stacks-model"
import { zip } from "ramda"

export interface ExpectStackResultProps {
  readonly stackPath: StackPath
  readonly stackName: StackName
}

export interface ExpectCommandPathResultProps<P> {
  readonly commandPath: CommandPath
  readonly stackResults?: ReadonlyArray<P>
}

export interface ExpectConfigSetResultProps<P> {
  readonly configSet: ConfigSetName
  readonly commandPathResults?: ReadonlyArray<ExpectCommandPathResultProps<P>>
}

export interface ExpectAccountResultProps<P> {
  readonly accountId: AccountId
  readonly status?: CommandStatus
  readonly configSetResults?: ReadonlyArray<ExpectConfigSetResultProps<P>>
}

export interface ExpectOrganizationalUnitResultProps<P> {
  readonly organizationalUnitPath: OrganizationalUnitPath
  readonly accountResults: ReadonlyArray<ExpectAccountResultProps<P>>
}

export interface ExpectStageResultProps<P> {
  readonly stageName: StageName
  readonly organizationalUnitResults: ReadonlyArray<
    ExpectOrganizationalUnitResultProps<P>
  >
  // Do not require accounts to be in a specified order
  readonly unorderedAccounts?: boolean
}

export interface AssertAccountOperationProps {
  readonly skipResultAssertions?: boolean
  readonly skipOutputAssertions?: boolean
}

export interface AccountsOperationOutputMatcher<
  P,
  O,
  R extends ResultsOutput<O>,
  T extends PlanExecutionResult<R>,
> {
  readonly expectCommandToSucceed: () => AccountsOperationOutputMatcher<
    P,
    O,
    R,
    T
  >

  readonly expectResults: (
    ...props: ReadonlyArray<ExpectStageResultProps<P>>
  ) => AccountsOperationOutputMatcher<P, O, R, T>

  readonly assert: (props?: AssertAccountOperationProps) => Promise<T>
}

type StageResultAssertion<O, R extends ResultsOutput<O>> = (
  result: StageExecutionResult<R>,
) => void

export type StackResultAssertion<O> = (result: O) => void
export type StackResultAssertionProvider<P, O> = (
  props: P,
) => StackResultAssertion<O>

export const StackOperationResultAssertionProvider: StackResultAssertionProvider<
  ExpectStackResultProps,
  StackResult
> = (props: ExpectStackResultProps) => (result: StackResult) => {
  expect(result.stack.path).toStrictEqual(props.stackPath)
  expect(result.stack.name).toStrictEqual(props.stackName)
}

interface CreateAccountsOperationOutputMatcherProps<
  P,
  O,
  R extends ResultsOutput<O>,
  T extends PlanExecutionResult<R>,
> {
  readonly executor: () => Promise<T>
  readonly outputAssertions?: (output: T) => void
  readonly stageAssertions: ReadonlyArray<StageResultAssertion<O, R>>
  readonly stackResultAssertionProvider: StackResultAssertionProvider<P, O>
}

const assertStackResults = <P, O, R extends ResultsOutput<O>>(
  stackResultAssertionProvider: StackResultAssertionProvider<P, O>,
  expectedResults: ReadonlyArray<P>,
  actualResults: ReadonlyArray<O>,
): void => {
  expect(actualResults).toHaveLength(expectedResults.length)

  zip(expectedResults, actualResults).forEach(([expected, actual]) => {
    const assertion = stackResultAssertionProvider(expected)
    assertion(actual)
  })
}

const assertCommandPathResults = <P, O, R extends ResultsOutput<O>>(
  stackResultAssertionProvider: StackResultAssertionProvider<P, O>,
  expectedResults: ReadonlyArray<ExpectCommandPathResultProps<P>>,
  actualResults: ReadonlyArray<CommandPathExecutionResult<R>>,
): void => {
  expect(actualResults).toHaveLength(expectedResults.length)

  zip(expectedResults, actualResults).forEach(([expected, actual]) => {
    expect(actual.commandPath).toStrictEqual(expected.commandPath)
    assertStackResults(
      stackResultAssertionProvider,
      expected.stackResults!,
      actual.result.results,
    )
  })
}

const assertConfigSetResults = <P, O, R extends ResultsOutput<O>>(
  stackResultAssertionProvider: StackResultAssertionProvider<P, O>,
  expectedResults: ReadonlyArray<ExpectConfigSetResultProps<P>>,
  actualResults: ReadonlyArray<ConfigSetExecutionResult<R>>,
): void => {
  expect(actualResults).toHaveLength(expectedResults.length)

  zip(expectedResults, actualResults).forEach(([expected, actual]) => {
    expect(actual.configSetName).toStrictEqual(expected.configSet)

    if (expected.commandPathResults) {
      assertCommandPathResults(
        stackResultAssertionProvider,
        expected.commandPathResults,
        actual.results,
      )
    }
  })
}

const assertAccountResults = <P, O, R extends ResultsOutput<O>>(
  stackResultAssertionProvider: StackResultAssertionProvider<P, O>,
  ouPath: OrganizationalUnitPath,
  expectedResults: ReadonlyArray<ExpectAccountResultProps<P>>,
  unorderedAccounts: boolean,
  actualResults: ReadonlyArray<TargetExecutionResult<R>>,
) => {
  expectedResults.forEach((expectedAccountResult, i) => {
    const actualAccountResult = unorderedAccounts
      ? actualResults.find(
          (a) => a.targetId === expectedAccountResult.accountId,
        )
      : actualResults[i]

    if (!actualAccountResult) {
      fail(
        `Expected account ${expectedAccountResult.accountId} to be found under organizational unit ${ouPath}`,
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
      assertConfigSetResults(
        stackResultAssertionProvider,
        expectedAccountResult.configSetResults,
        actualAccountResult.results,
      )
    }
  })
}

const assertOrganizationalUnitResults = <P, O, R extends ResultsOutput<O>>(
  stackResultAssertionProvider: StackResultAssertionProvider<P, O>,
  actualResults: ReadonlyArray<GroupExecutionResult<R>>,
  unorderedAccounts: boolean,
  expectedResults: ReadonlyArray<ExpectOrganizationalUnitResultProps<P>>,
): void => {
  expect(actualResults).toHaveLength(expectedResults.length)

  zip(expectedResults, actualResults).forEach(([expected, actual]) => {
    expect(actual.success).toStrictEqual(true)
    expect(actual.results).toHaveLength(expected.accountResults.length)

    assertAccountResults(
      stackResultAssertionProvider,
      expected.organizationalUnitPath,
      expected.accountResults,
      unorderedAccounts,
      actual.results,
    )
  })
}

const createStageAssertions = <P, O, R extends ResultsOutput<O>>(
  props: ReadonlyArray<ExpectStageResultProps<P>>,
  stackResultAssertionProvider: StackResultAssertionProvider<P, O>,
): ReadonlyArray<StageResultAssertion<O, R>> =>
  props.map((expected) => (actual) => {
    expect(actual.stageName).toStrictEqual(expected.stageName)

    assertOrganizationalUnitResults(
      stackResultAssertionProvider,
      actual.results,
      expected.unorderedAccounts === true,
      expected.organizationalUnitResults,
    )
  })

export const createAccountsOperationOutputMatcher = <
  P,
  O,
  R extends ResultsOutput<O>,
  T extends PlanExecutionResult<R>,
>({
  executor,
  outputAssertions,
  stageAssertions,
  stackResultAssertionProvider,
}: CreateAccountsOperationOutputMatcherProps<
  P,
  O,
  R,
  T
>): AccountsOperationOutputMatcher<P, O, R, T> => {
  const expectCommandToSucceed = () => {
    const assertions = (output: T) => {
      expect(output.status).toEqual("SUCCESS")
      expect(output.message).toEqual("Success")
      expect(output.success).toEqual(true)
      expect(output.error).toBeUndefined()
    }

    return createAccountsOperationOutputMatcher<P, O, R, T>({
      executor,
      outputAssertions: assertions,
      stackResultAssertionProvider,
      stageAssertions: [],
    })
  }

  const expectResults = (
    ...props: ReadonlyArray<ExpectStageResultProps<P>>
  ): AccountsOperationOutputMatcher<P, O, R, T> =>
    createAccountsOperationOutputMatcher({
      executor,
      outputAssertions,
      stackResultAssertionProvider,
      stageAssertions: [
        ...stageAssertions,
        ...createStageAssertions(props, stackResultAssertionProvider),
      ],
    })

  const assert = async (
    props: AssertAccountOperationProps = {
      skipOutputAssertions: false,
      skipResultAssertions: false,
    },
  ): Promise<T> => {
    const output = await executor()

    if (!props.skipOutputAssertions && outputAssertions) {
      outputAssertions(output)
    }

    if (props.skipResultAssertions) {
      return output
    }

    expect(output.results).toHaveLength(stageAssertions.length)
    if (!output.results) {
      fail("Expected output results to be defined")
    }

    zip(stageAssertions, output.results).forEach(([assertion, result]) =>
      assertion(result),
    )

    return output
  }

  return {
    expectCommandToSucceed,
    expectResults,
    assert,
  }
}
