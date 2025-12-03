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
    logger,
  }: CreateCustomStackProps<TestingCustomStackHandlerConfig>): Promise<
    CreateCustomStackResult<CustomStackState>
  > => {
    logger.info(`About to create custom stack '${stack.name}'`)

    const credentials = await stack.getCredentials()

    const client = new CloudFormationClient({
      credentials,
      region: stack.region,
    })

    try {
      logger.info(`Initiating stack creation`)
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
      logger.info(`Waiting for stack creation to complete`)
      await waitUntilStackCreateComplete(
        { client, maxWaitTime: 3 * 60 * 1000 },
        { StackName: stack.name },
      )

      logger.info(`Stack creation complete`)
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
    logger,
  }: UpdateCustomStackProps<
    TestingCustomStackHandlerConfig,
    CustomStackState
  >): Promise<UpdateCustomStackResult<CustomStackState>> => {
    logger.info(`About to update custom stack '${stack.name}'`)

    const credentials = await stack.getCredentials()

    const client = new CloudFormationClient({
      credentials,
      region: stack.region,
    })

    try {
      logger.info(`Initiating stack update`)
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

      logger.info(`Waiting for stack update to complete`)
      await waitUntilStackUpdateComplete(
        { client, maxWaitTime: 3 * 60 * 1000 },
        { StackName: stack.name },
      )

      logger.info(`Stack update complete`)

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
    logger,
  }: DeleteCustomStackProps<
    TestingCustomStackHandlerConfig,
    CustomStackState
  >): Promise<DeleteCustomStackResult> => {
    logger.info(`About to delete custom stack '${stack.name}'`)
    const credentials = await stack.getCredentials()

    const client = new CloudFormationClient({
      credentials,
      region: stack.region,
    })

    try {
      logger.info(`Initiating stack deletion`)
      await client.send(new DeleteStackCommand({ StackName: stack.name }))

      logger.info(`Waiting for stack deletion to complete`)
      await waitUntilStackDeleteComplete(
        { client, maxWaitTime: 2 * 60 * 1000 },
        { StackName: stack.name },
      )

      logger.info(`Stack deletion complete`)

      return {
        success: true,
      }
    } catch (e) {
      const error = e as any
      return { success: false, message: error.message, error }
    }
  },
}
