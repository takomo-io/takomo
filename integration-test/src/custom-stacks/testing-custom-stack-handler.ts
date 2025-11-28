import {
  CloudFormationClient,
  DeleteStackCommand,
  DescribeStacksCommand,
  Stack,
  waitUntilStackDeleteComplete,
  waitUntilStackCreateComplete,
  waitUntilStackUpdateComplete,
  CreateStackCommand,
  UpdateStackCommand,
} from "@aws-sdk/client-cloudformation"
import {
  CustomStackHandler,
  CustomStackState,
  CreateCustomStackProps,
  CreateCustomStackResult,
  DeleteCustomStackProps,
  DeleteCustomStackResult,
  GetChangesProps,
  GetChangesResult,
  GetCurrentStateProps,
  GetCurrentStateResult,
  ParseConfigProps,
  ParseConfigResult,
  UpdateCustomStackProps,
  UpdateCustomStackResult,
} from "../../../dist/index.js"
import { arrayToRecord } from "../../../src/utils/collections.js"

export type TestingCustomStackHandlerConfig = { stackTemplate: string }
export type TestingCustomStackHandlerState = CustomStackState & {}

const convertToCustomStackState = (stack?: Stack): CustomStackState => {
  if (!stack) {
    return { status: "PENDING" }
  }

  const outputs = arrayToRecord(
    stack.Outputs ?? [],
    (output) => output.OutputKey!,
    (output) => output.OutputValue!,
  )

  const tags = arrayToRecord(
    stack.Tags ?? [],
    (tag) => tag.Key!,
    (tag) => tag.Value!,
  )

  const parameters = arrayToRecord(
    stack.Parameters ?? [],
    (param) => param.ParameterKey!,
    (param) => param.ParameterValue!,
  )

  return { status: "CREATE_COMPLETE", outputs, tags, parameters }
}

const describeStack = async (
  client: CloudFormationClient,
  stackName: string,
): Promise<CustomStackState | undefined> => {
  try {
    const { Stacks = [] } = await client.send(
      new DescribeStacksCommand({ StackName: stackName }),
    )

    if (Stacks.length === 0) {
      return undefined
    }

    return convertToCustomStackState(Stacks[0])
  } catch (e) {
    const error = e as any
    if (error.Code === "ValidationError") {
      if (error.message === `Stack with id ${stackName} does not exist`) {
        return undefined
      }
    }

    throw e
  }
}

export const testingCustomStackHandler: CustomStackHandler<
  TestingCustomStackHandlerConfig,
  TestingCustomStackHandlerState
> = {
  type: "testing-custom-stack",
  getCurrentState: async ({
    stack,
  }: GetCurrentStateProps<TestingCustomStackHandlerConfig>): Promise<
    GetCurrentStateResult<CustomStackState>
  > => {
    const credentials = await stack.getCredentials()

    const client = new CloudFormationClient({
      credentials,
      region: stack.region,
    })

    try {
      const currentState = await describeStack(client, stack.name)

      if (currentState) {
        return {
          currentState,
          success: true,
        }
      }
      return { currentState: { status: "PENDING" }, success: true }
    } catch (e) {
      const error = e as any
      if (error.Code === "ValidationError") {
        if (error.message === `Stack with id ${stack.name} does not exist`) {
          return { currentState: { status: "PENDING" }, success: true }
        }
      }

      return { success: false, error, message: error.message }
    }
  },
  getChanges: async ({
    stack,
  }: GetChangesProps<
    TestingCustomStackHandlerConfig,
    CustomStackState
  >): Promise<GetChangesResult> => {
    const credentials = await stack.getCredentials()

    const client = new CloudFormationClient({
      credentials,
      region: stack.region,
    })

    try {
      const state = await describeStack(client, stack.name)

      if (state) {
        // TODO: Support detecting actual changes
        return {
          changes: [{ description: "Stack exists and will be updated" }],
          success: true,
        }
      }

      return {
        changes: [{ description: "Stack does not exist and will be created" }],
        success: true,
      }
    } catch (e) {
      const error = e as any
      return { success: false, error, message: error.message }
    }
  },
  parseConfig: async ({
    rawConfig,
  }: ParseConfigProps): Promise<
    ParseConfigResult<TestingCustomStackHandlerConfig>
  > => {
    const configObj = rawConfig as Record<string, unknown>

    if (configObj.stackTemplate === undefined) {
      return {
        success: false,
        message: "stackTemplate is required in custom stack config",
      }
    }

    if (typeof configObj.stackTemplate !== "string") {
      return {
        success: false,
        message: "stackTemplate is must be string in custom stack config",
      }
    }

    return {
      success: true,
      parsedConfig: configObj as TestingCustomStackHandlerConfig,
    }
  },
  create: async ({
    stack,
    config,
    tags,
    parameters,
  }: CreateCustomStackProps<TestingCustomStackHandlerConfig>): Promise<
    CreateCustomStackResult<CustomStackState>
  > => {
    const credentials = await stack.getCredentials()

    const client = new CloudFormationClient({
      credentials,
      region: stack.region,
    })

    try {
      await client.send(
        new CreateStackCommand({
          StackName: stack.name,
          TemplateBody: config.stackTemplate,
          Tags: Object.entries(tags).map(([Key, Value]) => ({ Key, Value })),
          Parameters: Object.entries(parameters).map(
            ([ParameterKey, ParameterValue]) => ({
              ParameterKey,
              ParameterValue,
            }),
          ),
        }),
      )
      await waitUntilStackCreateComplete(
        { client, maxWaitTime: 3 * 60 * 1000 },
        { StackName: stack.name },
      )

      const createdState = await describeStack(client, stack.name)

      if (createdState) {
        return {
          createdState,
          success: true,
        }
      }

      throw new Error("Failed to retrieve stack state after creation")
    } catch (e) {
      const error = e as any
      return { success: false, message: error.message, error }
    }
  },
  update: async ({
    stack,
    config,
    tags,
    parameters,
  }: UpdateCustomStackProps<
    TestingCustomStackHandlerConfig,
    CustomStackState
  >): Promise<UpdateCustomStackResult<CustomStackState>> => {
    const credentials = await stack.getCredentials()

    const client = new CloudFormationClient({
      credentials,
      region: stack.region,
    })

    try {
      await client.send(
        new UpdateStackCommand({
          StackName: stack.name,
          TemplateBody: config.stackTemplate,
          Tags: Object.entries(tags).map(([Key, Value]) => ({ Key, Value })),
          Parameters: Object.entries(parameters).map(
            ([ParameterKey, ParameterValue]) => ({
              ParameterKey,
              ParameterValue,
            }),
          ),
        }),
      )
      await waitUntilStackUpdateComplete(
        { client, maxWaitTime: 3 * 60 * 1000 },
        { StackName: stack.name },
      )

      const updatedState = await describeStack(client, stack.name)

      if (updatedState) {
        return {
          updatedState,
          success: true,
        }
      }

      throw new Error("Failed to retrieve stack state after update")
    } catch (e) {
      const error = e as any
      return { success: false, message: error.message, error }
    }
  },
  delete: async ({
    stack,
  }: DeleteCustomStackProps<
    TestingCustomStackHandlerConfig,
    CustomStackState
  >): Promise<DeleteCustomStackResult> => {
    const credentials = await stack.getCredentials()

    const client = new CloudFormationClient({
      credentials,
      region: stack.region,
    })

    try {
      await client.send(new DeleteStackCommand({ StackName: stack.name }))
      await waitUntilStackDeleteComplete(
        { client, maxWaitTime: 2 * 60 * 1000 },
        { StackName: stack.name },
      )

      return {
        success: true,
      }
    } catch (e) {
      const error = e as any
      return { success: false, message: error.message, error }
    }
  },
}
