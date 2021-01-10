import { StackName, StackStatus } from "@takomo/aws-model"
import { CommandStatus } from "@takomo/core"
import {
  ListStacksOutput,
  StacksOperationOutput,
} from "@takomo/stacks-commands"
import { StackInfo } from "@takomo/stacks-commands/src/stacks/list/model"
import { StackPath, StackResult } from "@takomo/stacks-model"

export interface ExpectStackResultProps {
  readonly stackPath: StackPath
  readonly stackName: StackName
  readonly status: CommandStatus
  readonly success: boolean
  readonly message: string
  readonly errorMessage?: string
}

export type ExpectSuccessStackResultProps = Omit<
  ExpectStackResultProps,
  "success" | "status"
>

export type ExpectSkippedStackResultProps = Omit<
  ExpectStackResultProps,
  "success" | "status"
>

export type ExpectFailureStackResultProps = Omit<
  ExpectStackResultProps,
  "success" | "status"
>

export type ExpectStackCreateSuccessProps = Omit<
  ExpectSuccessStackResultProps,
  "message"
>

export type ExpectStackDeleteSuccessProps = Omit<
  ExpectSuccessStackResultProps,
  "message"
>

export type ExpectStackUpdateSuccessProps = Omit<
  ExpectSuccessStackResultProps,
  "message"
>

export type ExpectStackCreateFailProps = Omit<
  ExpectFailureStackResultProps,
  "message"
>

export interface StackResultsMatcher {
  expectStackResult: (props: ExpectStackResultProps) => StackResultsMatcher
  expectSuccessStackResult: (
    props: ExpectSuccessStackResultProps,
  ) => StackResultsMatcher
  expectFailureStackResult: (
    props: ExpectFailureStackResultProps,
  ) => StackResultsMatcher
  expectStackCreateSuccess: (
    props: ExpectStackCreateSuccessProps,
  ) => StackResultsMatcher
  expectStackCreateFail: (
    props: ExpectStackCreateFailProps,
  ) => StackResultsMatcher
  expectStackUpdateSuccess: (
    props: ExpectStackUpdateSuccessProps,
  ) => StackResultsMatcher
  expectStackUpdateSuccessWithNoChanges: (
    props: ExpectStackUpdateSuccessProps,
  ) => StackResultsMatcher
  expectStackUpdateFail: (
    props: ExpectStackUpdateSuccessProps,
  ) => StackResultsMatcher
  expectStackDeleteSuccess: (
    props: ExpectStackDeleteSuccessProps,
  ) => StackResultsMatcher
  expectSkippedStackResult: (
    props: ExpectSkippedStackResultProps,
  ) => StackResultsMatcher
  assert: () => Promise<StacksOperationOutput>
}

const createStackResultsMatcher = (
  executor: () => Promise<StacksOperationOutput>,
  outputAssertions: (output: StacksOperationOutput) => void,
  stackAssertions: ((stackResult: StackResult) => boolean)[] = [],
): StackResultsMatcher => {
  const expectStackResult = ({
    stackPath,
    stackName,
    status,
    success,
    message,
    errorMessage,
  }: ExpectStackResultProps): StackResultsMatcher => {
    const stackResultMatcher = (stackResult: StackResult): boolean => {
      if (stackResult.stack.path !== stackPath) {
        return false
      }

      expect(stackResult.stack.name).toEqual(stackName)
      expect(stackResult.message).toEqual(message)
      expect(stackResult.status).toEqual(status)
      expect(stackResult.success).toEqual(success)

      if (errorMessage) {
        expect(stackResult.error).toBeDefined()
        expect(stackResult.error?.message).toEqual(errorMessage)
      } else {
        expect(stackResult.error).toBeUndefined()
      }

      return true
    }

    return createStackResultsMatcher(executor, outputAssertions, [
      ...stackAssertions,
      stackResultMatcher,
    ])
  }

  const expectSuccessStackResult = (
    props: ExpectSuccessStackResultProps,
  ): StackResultsMatcher =>
    expectStackResult({
      ...props,
      success: true,
      status: "SUCCESS",
    })

  const expectSkippedStackResult = (
    props: ExpectSkippedStackResultProps,
  ): StackResultsMatcher =>
    expectStackResult({
      ...props,
      success: true,
      status: "SKIPPED",
    })

  const expectStackCreateSuccess = (
    props: ExpectStackCreateSuccessProps,
  ): StackResultsMatcher =>
    expectSuccessStackResult({
      ...props,
      message: "Stack create succeeded",
    })

  const expectFailureStackResult = (
    props: ExpectFailureStackResultProps,
  ): StackResultsMatcher =>
    expectStackResult({
      ...props,
      success: false,
      status: "FAILED",
    })

  const expectStackCreateFail = (
    props: ExpectStackCreateFailProps,
  ): StackResultsMatcher =>
    expectFailureStackResult({
      ...props,
      message: "Stack create failed",
    })

  const expectStackDeleteSuccess = (
    props: ExpectStackDeleteSuccessProps,
  ): StackResultsMatcher =>
    expectSuccessStackResult({
      ...props,
      message: "Stack delete succeeded",
    })

  const expectStackUpdateSuccess = (
    props: ExpectStackUpdateSuccessProps,
  ): StackResultsMatcher =>
    expectSuccessStackResult({
      ...props,
      message: "Stack update succeeded",
    })

  const expectStackUpdateSuccessWithNoChanges = (
    props: ExpectStackUpdateSuccessProps,
  ): StackResultsMatcher =>
    expectSuccessStackResult({
      ...props,
      message: "No changes",
    })

  const expectStackUpdateFail = (
    props: ExpectStackUpdateSuccessProps,
  ): StackResultsMatcher =>
    expectFailureStackResult({
      ...props,
      message: "Stack update failed",
    })

  const assert = async (): Promise<StacksOperationOutput> => {
    const output = await executor()
    outputAssertions(output)
    expect(output.results).toHaveLength(stackAssertions.length)
    output.results.forEach((result) => {
      if (!stackAssertions.some((s) => s(result))) {
        fail(`Unexpected result for stack with path: ${result.stack.path}`)
      }
    })
    return output
  }

  return {
    assert,
    expectStackResult,
    expectSuccessStackResult,
    expectSkippedStackResult,
    expectStackCreateSuccess,
    expectStackCreateFail,
    expectStackUpdateSuccess,
    expectStackUpdateSuccessWithNoChanges,
    expectStackUpdateFail,
    expectStackDeleteSuccess,
    expectFailureStackResult,
  }
}

export interface StacksOperationOutputMatcher {
  expectCommandToSucceed: () => StackResultsMatcher
  expectCommandToSkip: (message: string) => StackResultsMatcher
  expectCommandToFail: (message: string) => StackResultsMatcher
  expectCommandToCancel: () => StackResultsMatcher
  expectCommandToThrow: (error: any) => Promise<void>
}

export interface ListStacksOutputMatcher {
  expectOutputToBeSuccessful: () => ListStacksOutputMatcher
  expectStack: (props: ExpectStackProps) => ListStacksOutputMatcher
  assert: () => Promise<ListStacksOutput>
}

export const createStacksOperationOutputMatcher = (
  executor: () => Promise<StacksOperationOutput>,
): StacksOperationOutputMatcher => {
  const expectCommandToSucceed = () =>
    createStackResultsMatcher(executor, (output) => {
      expect(output.status).toEqual("SUCCESS")
      expect(output.message).toEqual("Success")
      expect(output.success).toEqual(true)
      expect(output.error).toBeUndefined()
    })

  const expectCommandToSkip = (message: string) =>
    createStackResultsMatcher(executor, (output) => {
      expect(output.status).toEqual("SKIPPED")
      expect(output.message).toEqual(message)
      expect(output.success).toEqual(true)
      expect(output.error).toBeUndefined()
    })

  const expectCommandToFail = (message: string) =>
    createStackResultsMatcher(executor, (output) => {
      expect(output.status).toEqual("FAILED")
      expect(output.message).toEqual(message)
      expect(output.success).toEqual(false)
      expect(output.error).toBeUndefined()
    })

  const expectCommandToCancel = () =>
    createStackResultsMatcher(executor, (output) => {
      expect(output.status).toEqual("CANCELLED")
      expect(output.message).toEqual("Cancelled")
      expect(output.success).toEqual(false)
      expect(output.error).toBeUndefined()
    })

  const expectCommandToThrow = async (error: any): Promise<void> => {
    await expect(executor).rejects.toEqual(error)
  }

  return {
    expectCommandToSucceed,
    expectCommandToCancel,
    expectCommandToSkip,
    expectCommandToFail,
    expectCommandToThrow,
  }
}

interface ExpectStackProps {
  readonly stackName: StackName
  readonly stackPath: StackPath
  readonly status?: StackStatus
}

export const createListStacksOutputMatcher = (
  executor: () => Promise<ListStacksOutput>,
  stackAssertions: ((stackResult: StackInfo) => boolean)[] = [],
  outputAssertions?: (output: ListStacksOutput) => void,
): ListStacksOutputMatcher => {
  const expectOutputToBeSuccessful = () =>
    createListStacksOutputMatcher(executor, stackAssertions, (output) => {
      expect(output.status).toEqual("SUCCESS")
      expect(output.message).toEqual("Success")
      expect(output.success).toEqual(true)
      expect(output.error).toBeUndefined()
    })

  const expectStack = ({
    stackName,
    stackPath,
    status,
  }: ExpectStackProps): ListStacksOutputMatcher => {
    const stackMatcher = (stackResult: StackInfo): boolean => {
      if (stackResult.stack.path !== stackPath) {
        return false
      }

      expect(stackResult.stack.path).toEqual(stackPath)
      expect(stackResult.stack.name).toEqual(stackName)

      if (status) {
        if (stackResult.current) {
          expect(stackResult.current.status).toEqual(status)
        } else {
          fail("Expected current stack to be defined")
        }
      } else {
        expect(stackResult.current).toBeUndefined()
      }

      return true
    }

    return createListStacksOutputMatcher(
      executor,
      [...stackAssertions, stackMatcher],
      outputAssertions,
    )
  }

  const assert = async (): Promise<ListStacksOutput> => {
    const output = await executor()
    if (outputAssertions) {
      outputAssertions(output)
    }
    expect(output.stacks).toHaveLength(stackAssertions.length)
    output.stacks.forEach((result) => {
      if (!stackAssertions.some((s) => s(result))) {
        fail(`Unexpected stack with path: ${result.stack.path}`)
      }
    })
    return output
  }

  return {
    expectOutputToBeSuccessful,
    expectStack,
    assert,
  }
}
