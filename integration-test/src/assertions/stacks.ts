import { Stack } from "@aws-sdk/client-cloudformation"
import { Credentials } from "@aws-sdk/types"
import {
  AccountId,
  Region,
  StackDriftDetectionStatus,
  StackDriftDetectionStatusReason,
  StackDriftStatus,
  StackName,
  StackOutputKey,
  StackOutputValue,
  StackPolicyBody,
  StackStatus,
  TagKey,
  TagValue,
} from "../../../src/takomo-aws-model"
import { CommandStatus } from "../../../src/takomo-core"
import {
  DetectDriftOutput,
  ListStacksOutput,
  StackDriftInfo,
  StackInfo,
  StacksOperationOutput,
} from "../../../src/takomo-stacks-commands"
import { StackPath, StackResult } from "../../../src/takomo-stacks-model"
import { prettyPrintJson, toPrettyJson } from "../../../src/takomo-util"
import { aws } from "../aws-api"

export interface ExpectStackResultProps {
  readonly stackPath: StackPath
  readonly stackName: StackName
  readonly status: CommandStatus
  readonly success: boolean
  readonly message: string
  readonly errorMessage?: string
  readonly errorMessageToContain?: string
  readonly expectDeployedStack?: Omit<ExpectDeployedCfStackPropsV2, "stackPath">
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

export interface ExpectDeployedCfStackProps {
  stackName: StackName
  region: Region
  accountId: AccountId
  credentials: Credentials
  roleName: string
  expected?: Partial<Stack>
  expectedTags?: Record<TagKey, TagValue>
  expectedOutputs?: Record<StackOutputKey, StackOutputValue>
  expectedStackPolicy?: StackPolicyBody
  expectedDescription?: string
}

export interface ExpectDeployedCfStackPropsV2 {
  stackPath: StackPath
  tags?: Record<TagKey, TagValue>
  outputs?: Record<StackOutputKey, StackOutputValue>
  description?: string
  stackPolicy?: StackPolicyBody
  terminationProtection?: boolean
}

export interface StackResultsMatcher {
  expectStackResult: (props: ExpectStackResultProps) => StackResultsMatcher
  expectSuccessStackResult: (
    props: ExpectSuccessStackResultProps,
  ) => StackResultsMatcher
  expectFailureStackResult: (
    props: ExpectFailureStackResultProps,
  ) => StackResultsMatcher
  expectStackCreateSuccess: (
    ...props: ExpectStackCreateSuccessProps[]
  ) => StackResultsMatcher
  expectStackCreateFail: (
    props: ExpectStackCreateFailProps,
  ) => StackResultsMatcher
  expectStackUpdateSuccess: (
    ...props: ExpectStackUpdateSuccessProps[]
  ) => StackResultsMatcher
  expectStackUpdateSuccessWithNoChanges: (
    ...props: ExpectStackUpdateSuccessProps[]
  ) => StackResultsMatcher
  expectStackUpdateFail: (
    props: ExpectStackUpdateSuccessProps,
  ) => StackResultsMatcher
  expectStackDeleteSuccess: (
    ...props: ExpectStackDeleteSuccessProps[]
  ) => StackResultsMatcher
  expectSkippedStackResult: (
    props: ExpectSkippedStackResultProps,
  ) => StackResultsMatcher
  expectDeployedCfStack: (
    props: ExpectDeployedCfStackProps,
  ) => StackResultsMatcher
  expectDeployedCfStackV2: (
    props: ExpectDeployedCfStackPropsV2,
  ) => StackResultsMatcher
  assert: () => Promise<StacksOperationOutput>
}

type DeployedCfStackAssertion = (
  output: StacksOperationOutput,
) => Promise<() => void>

const createStackResultsMatcher = (
  executor: () => Promise<StacksOperationOutput>,
  outputAssertions: (output: StacksOperationOutput) => void,
  stackAssertions: ((stackResult: StackResult) => boolean)[] = [],
  deployedCfStackAssertions: DeployedCfStackAssertion[] = [],
): StackResultsMatcher => {
  const expectStackResult = ({
    stackPath,
    stackName,
    status,
    success,
    message,
    errorMessage,
    errorMessageToContain,
    expectDeployedStack,
  }: ExpectStackResultProps): StackResultsMatcher => {
    const stackResultMatcher = (stackResult: StackResult): boolean => {
      if (stackResult.stack.path !== stackPath) {
        return false
      }

      expect(stackResult.stack.name).toEqual(stackName)
      expect(stackResult.message).toEqual(message)
      expect(stackResult.status).toEqual(status)
      expect(stackResult.success).toEqual(success)

      if (errorMessage || errorMessageToContain) {
        expect(stackResult.error).toBeDefined()

        if (errorMessageToContain) {
          expect(stackResult.error?.message).toContain(errorMessageToContain)
        } else if (errorMessage) {
          expect(stackResult.error?.message).toEqual(errorMessage)
        }
      } else {
        expect(stackResult.error).toBeUndefined()
      }

      return true
    }

    if (!expectDeployedStack) {
      return createStackResultsMatcher(
        executor,
        outputAssertions,
        [...stackAssertions, stackResultMatcher],
        deployedCfStackAssertions,
      )
    }

    const deployedStackMatcher = createDeployedCfStackAssertion({
      stackPath,
      ...expectDeployedStack,
    })

    return createStackResultsMatcher(
      executor,
      outputAssertions,
      [...stackAssertions, stackResultMatcher],
      [...deployedCfStackAssertions, deployedStackMatcher],
    )
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
    ...props: ExpectStackCreateSuccessProps[]
  ): StackResultsMatcher => {
    if (props.length === 0) {
      throw new Error("At least one stack must be given")
    }

    const [first, ...rest] = props

    const matcher = expectSuccessStackResult({
      ...first,
      message: "Stack create succeeded",
    })

    return rest.length === 0
      ? matcher
      : matcher.expectStackCreateSuccess(...rest)
  }

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
    ...props: ExpectStackDeleteSuccessProps[]
  ): StackResultsMatcher => {
    if (props.length === 0) {
      throw new Error("At least one stack must be given")
    }

    const [first, ...rest] = props

    const matcher = expectSuccessStackResult({
      ...first,
      message: "Stack delete succeeded",
    })

    return rest.length === 0
      ? matcher
      : matcher.expectStackDeleteSuccess(...rest)
  }

  const expectStackUpdateSuccess = (
    ...props: ExpectStackUpdateSuccessProps[]
  ): StackResultsMatcher => {
    if (props.length === 0) {
      throw new Error("At least one stack must be given")
    }

    const [first, ...rest] = props

    const matcher = expectSuccessStackResult({
      ...first,
      message: "Stack update succeeded",
    })

    return rest.length === 0
      ? matcher
      : matcher.expectStackUpdateSuccess(...rest)
  }

  const expectStackUpdateSuccessWithNoChanges = (
    ...props: ExpectStackUpdateSuccessProps[]
  ): StackResultsMatcher => {
    if (props.length === 0) {
      throw new Error("At least one stack must be given")
    }

    const [first, ...rest] = props

    const matcher = expectSuccessStackResult({
      ...first,
      message: "No changes",
    })

    return rest.length === 0
      ? matcher
      : matcher.expectStackUpdateSuccessWithNoChanges(...rest)
  }

  const expectStackUpdateFail = (
    props: ExpectStackUpdateSuccessProps,
  ): StackResultsMatcher =>
    expectFailureStackResult({
      ...props,
      message: "Stack update failed",
    })

  const createDeployedCfStackAssertion = ({
    stackPath,
    outputs,
    tags,
    description,
    stackPolicy,
    terminationProtection,
  }: ExpectDeployedCfStackPropsV2) => {
    const deployedStackMatcher: DeployedCfStackAssertion = async (
      output: StacksOperationOutput,
    ): Promise<() => void> => {
      const actualStackResult = output.results.find(
        (r) => r.stack.path === stackPath,
      )
      if (!actualStackResult) {
        throw new Error(
          `Expected to found result for a stack with '${stackPath}'`,
        )
      }

      const { name, region } = actualStackResult.stack
      const credentials = await actualStackResult.stack.getCredentials()

      const { accountId } =
        await actualStackResult.stack.credentialManager.getCallerIdentity()

      const params = {
        region,
        credentials,
        stackName: name,
        iamRoleArn: `arn:aws:iam::${accountId}:role/OrganizationAccountAccessRole`,
      }

      const [stack, actualStackPolicy] = await Promise.all([
        aws.cloudFormation.describeStack(params),
        aws.cloudFormation.getStackPolicy(params),
      ])

      if (!stack) {
        throw new Error(
          `Could not find a stack with params:\n\n${toPrettyJson(params)}`,
        )
      }

      return () => {
        if (description) {
          expect(stack.Description).toStrictEqual(description)
        }

        if (tags) {
          const actual = (stack.Tags ?? []).reduce(
            (collected, tag) => ({
              ...collected,
              [tag.Key!]: tag.Value!,
            }),
            {},
          )

          expect(actual).toStrictEqual(tags)
        }

        if (outputs) {
          const actual = (stack.Outputs ?? []).reduce(
            (collected, o) => ({
              ...collected,
              [o.OutputKey!]: o.OutputValue!,
            }),
            {},
          )

          expect(actual).toStrictEqual(outputs)
        }

        if (stackPolicy) {
          const prettyExpectedStackPolicy = prettyPrintJson(stackPolicy)
          const prettyActualStackPolicy = actualStackPolicy
            ? prettyPrintJson(stackPolicy)
            : undefined

          expect(prettyActualStackPolicy).toStrictEqual(
            prettyExpectedStackPolicy,
          )
        }

        if (terminationProtection !== undefined) {
          expect(stack.EnableTerminationProtection).toStrictEqual(
            terminationProtection,
          )
        }
      }
    }

    return deployedStackMatcher
  }

  const expectDeployedCfStackV2 = (
    props: ExpectDeployedCfStackPropsV2,
  ): StackResultsMatcher => {
    const deployedStackMatcher = createDeployedCfStackAssertion(props)

    return createStackResultsMatcher(
      executor,
      outputAssertions,
      stackAssertions,
      [...deployedCfStackAssertions, deployedStackMatcher],
    )
  }

  const expectDeployedCfStack = ({
    stackName,
    credentials,
    region,
    accountId,
    roleName,
    expected,
    expectedTags,
    expectedOutputs,
    expectedDescription,
    expectedStackPolicy,
  }: ExpectDeployedCfStackProps): StackResultsMatcher => {
    const deployedStackMatcher: DeployedCfStackAssertion = async () => {
      const params = {
        stackName,
        region,
        credentials,
        iamRoleArn: `arn:aws:iam::${accountId}:role/${roleName}`,
      }

      const [stack, stackPolicy]: [any, any] = await Promise.all([
        aws.cloudFormation.describeStack(params),
        aws.cloudFormation.getStackPolicy(params),
      ])

      return () => {
        if (expected) {
          for (const [key, value] of Object.entries(expected)) {
            if (value !== undefined && value !== null) {
              expect(stack[key]).toStrictEqual(value)
            }
          }
        }

        if (expectedDescription) {
          expect(stack["Description"]).toStrictEqual(expectedDescription)
        }

        if (expectedTags) {
          const actual = stack["Tags"].reduce(
            (collected: any, tag: any) => ({
              ...collected,
              [tag.Key!]: tag.Value!,
            }),
            {},
          )

          expect(actual).toStrictEqual(expectedTags)
        }

        if (expectedOutputs) {
          const actual = stack["Outputs"].reduce(
            (collected: any, output: any) => ({
              ...collected,
              [output.OutputKey!]: output.OutputValue!,
            }),
            {},
          )

          expect(actual).toStrictEqual(expectedOutputs)
        }

        if (expectedStackPolicy) {
          const prettyExpectedStackPolicy = prettyPrintJson(expectedStackPolicy)
          const prettyActualStackPolicy = stackPolicy
            ? prettyPrintJson(stackPolicy)
            : undefined

          expect(prettyActualStackPolicy).toStrictEqual(
            prettyExpectedStackPolicy,
          )
        }
      }
    }

    return createStackResultsMatcher(
      executor,
      outputAssertions,
      stackAssertions,
      [...deployedCfStackAssertions, deployedStackMatcher],
    )
  }

  const assert = async (): Promise<StacksOperationOutput> => {
    const output = await executor()
    outputAssertions(output)
    expect(output.results).toHaveLength(stackAssertions.length)
    output.results.forEach((result) => {
      if (!stackAssertions.some((s) => s(result))) {
        throw new Error(
          `Unexpected result for stack with path: ${result.stack.path}`,
        )
      }
    })

    const deployedCfStackMatchers = await Promise.all(
      deployedCfStackAssertions.map(async (r) => r(output)),
    )

    deployedCfStackMatchers.forEach((r) => r())

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
    expectDeployedCfStack,
    expectDeployedCfStackV2,
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
    await expect(executor).rejects.toThrow(error)
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
      if (stackResult.path !== stackPath) {
        return false
      }

      expect(stackResult.path).toEqual(stackPath)
      expect(stackResult.name).toEqual(stackName)

      if (status) {
        expect(stackResult.status).toEqual(status)
      } else {
        expect(stackResult.status).toBeUndefined()
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
    expect(output.results).toHaveLength(stackAssertions.length)
    output.results.forEach((result) => {
      if (!stackAssertions.some((s) => s(result))) {
        fail(`Unexpected stack with path: ${result.path}`)
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

interface ExpectDriftProps {
  readonly stackName: StackName
  readonly stackPath: StackPath
  readonly status?: StackStatus
  readonly detectionStatus?: StackDriftDetectionStatus
  readonly detectionStatusReason?: StackDriftDetectionStatusReason
  readonly driftedStackResourceCount?: number
  readonly stackDriftStatus?: StackDriftStatus
}

export interface DetectDriftOutputMatcher {
  expectCommandToSucceed: () => DetectDriftOutputMatcher
  expectCommandToFail: () => DetectDriftOutputMatcher
  expectStack: (props: ExpectDriftProps) => DetectDriftOutputMatcher
  assert: () => Promise<DetectDriftOutput>
}

export const createDetectDriftOutputMatcher = (
  executor: () => Promise<DetectDriftOutput>,
  stackAssertions: ((stackResult: StackDriftInfo) => boolean)[] = [],
  outputAssertions?: (output: DetectDriftOutput) => void,
): DetectDriftOutputMatcher => {
  const expectCommandToSucceed = () =>
    createDetectDriftOutputMatcher(executor, stackAssertions, (output) => {
      expect(output.status).toEqual("SUCCESS")
      expect(output.message).toEqual("Success")
      expect(output.success).toEqual(true)
      expect(output.error).toBeUndefined()
    })

  const expectCommandToFail = () =>
    createDetectDriftOutputMatcher(executor, stackAssertions, (output) => {
      expect(output.status).toEqual("FAILED")
      expect(output.message).toEqual("Failed")
      expect(output.success).toEqual(false)
      expect(output.error).toBeUndefined()
    })

  const expectStack = ({
    stackName,
    stackPath,
    status,
    detectionStatus,
    detectionStatusReason,
    driftedStackResourceCount,
    stackDriftStatus,
  }: ExpectDriftProps): DetectDriftOutputMatcher => {
    const stackMatcher = (stackResult: StackDriftInfo): boolean => {
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

      if (detectionStatusReason) {
        if (stackResult.driftDetectionStatus) {
          expect(
            stackResult.driftDetectionStatus.detectionStatusReason,
          ).toEqual(detectionStatusReason)
        } else {
          fail("Expected drift detection status to be defined")
        }
      }

      if (detectionStatus) {
        if (stackResult.driftDetectionStatus) {
          expect(stackResult.driftDetectionStatus.detectionStatus).toEqual(
            detectionStatus,
          )
        } else {
          fail("Expected drift detection status to be defined")
        }
      }

      if (driftedStackResourceCount) {
        if (stackResult.driftDetectionStatus) {
          expect(
            stackResult.driftDetectionStatus.driftedStackResourceCount,
          ).toEqual(driftedStackResourceCount)
        } else {
          fail("Expected drift detection status to be defined")
        }
      }

      if (stackDriftStatus) {
        if (stackResult.driftDetectionStatus) {
          expect(stackResult.driftDetectionStatus.stackDriftStatus).toEqual(
            stackDriftStatus,
          )
        } else {
          fail("Expected drift detection status to be defined")
        }
      }

      return true
    }

    return createDetectDriftOutputMatcher(
      executor,
      [...stackAssertions, stackMatcher],
      outputAssertions,
    )
  }

  const assert = async (): Promise<DetectDriftOutput> => {
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
    expectCommandToSucceed,
    expectCommandToFail,
    expectStack,
    assert,
  }
}
