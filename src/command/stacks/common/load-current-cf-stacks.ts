import {
  CloudFormationStackSummary,
  StackName,
} from "../../../aws/cloudformation/model.js"
import { CustomStackHandlerRegistry } from "../../../custom-stack-handler/custom-stack-handler-registry.js"
import {
  InternalCustomStack,
  isInternalCustomStack,
} from "../../../stacks/custom-stack.js"
import { InternalStack, StackPath } from "../../../stacks/stack.js"
import {
  InternalStandardStack,
  isInternalStandardStack,
} from "../../../stacks/standard-stack.js"
import { TkmLogger } from "../../../utils/logging.js"
import { checksum } from "../../../utils/strings.js"
import { CustomStackState } from "../../../custom-stack-handler/custom-stack-handler.js"
import { exhaustiveCheck } from "../../../utils/exhaustive-check.js"
import { CustomStackHandler } from "../../../custom-stack-handler/custom-stack-handler.js"

const makeCredentialsRegionHash = async (
  stack: InternalStack,
): Promise<string> => {
  const { accessKeyId, secretAccessKey, sessionToken } =
    await stack.getCredentials()

  return checksum(
    [stack.region, accessKeyId, secretAccessKey, sessionToken].join(":"),
  )
}

const loadCfStacks = (
  stacks: ReadonlyArray<InternalStandardStack>,
): Promise<Map<StackName, CloudFormationStackSummary>> => {
  const stackNames = stacks.map((s) => s.name)
  return stacks[0]
    .getCloudFormationClient()
    .then((client) => client.listNotDeletedStacks(stackNames))
}

export interface CustomStackPair {
  readonly stack: InternalCustomStack
  readonly current?: CustomStackState
}

export interface StandardStackPair {
  readonly stack: InternalStandardStack
  readonly current?: CloudFormationStackSummary
}

export type StackPair = CustomStackPair | StandardStackPair

export const isCustomStackPair = (pair: StackPair): pair is CustomStackPair =>
  isInternalCustomStack(pair.stack)

export const isStandardStackPair = (
  pair: StackPair,
): pair is StandardStackPair => isInternalStandardStack(pair.stack)

const buildHashStackMap = <S extends InternalStack>(
  stackHashPairs: ReadonlyArray<[string, S]>,
): Map<string, S[]> => {
  const stackHashMap = new Map<string, S[]>()
  stackHashPairs.forEach(([hash, stack]) => {
    const stacks = stackHashMap.get(hash)
    if (stacks) {
      stacks.push(stack)
    } else {
      stackHashMap.set(hash, [stack])
    }
  })

  return stackHashMap
}

const loadCurrentStandardStacks = async (
  logger: TkmLogger,
  stacks: ReadonlyArray<InternalStandardStack>,
): Promise<Map<StackPath, CloudFormationStackSummary>> => {
  logger.debug("Load current standard stacks")

  const stackHashPairs: ReadonlyArray<[string, InternalStandardStack]> =
    await Promise.all(
      stacks.map(async (stack) => {
        const hash = await makeCredentialsRegionHash(stack)
        return [hash, stack]
      }),
    )

  const stackHashMap = buildHashStackMap(stackHashPairs)

  const stackMap = new Map<StackPath, CloudFormationStackSummary>()
  for (const stacksWithSameCredentials of stackHashMap.values()) {
    const cfStacks = await loadCfStacks(stacksWithSameCredentials)
    for (const [stackName, cfStack] of cfStacks) {
      stackMap.set(stackName, cfStack)
    }
  }

  return stackMap
}

export const parseCustomStackConfig = async (
  stack: InternalCustomStack,
  handler: CustomStackHandler<any, any>,
): Promise<void> => {
  try {
    const result = await handler.parseConfig({
      config: stack.customConfig,
      logger: stack.logger,
    })

    if (result.success) {
      return result.config
    }

    const { message, error } = result

    stack.logger.error(
      `Parsing custom stack config failed for stack ${stack.path}: ${message}`,
      error,
    )
    throw new Error(
      `Parsing custom stack config failed for stack ${stack.path}`,
    )
  } catch (e) {
    stack.logger.error(
      `Parsing custom stack config failed for stack ${stack.path}`,
      e,
    )

    throw e
  }
}

export const getCustomStackState = async (
  stack: InternalCustomStack,
  handler: CustomStackHandler<any, any>,
  config: unknown,
): Promise<CustomStackState> => {
  try {
    const result = await handler.getCurrentState({
      logger: stack.logger,
      config,
    })

    if (result.success) {
      return result.state
    }

    const { message, error } = result

    stack.logger.error(
      `Getting custom stack state failed for stack ${stack.path}: ${message}`,
      error,
    )
    throw new Error(`Getting custom stack state failed for stack ${stack.path}`)
  } catch (e) {
    stack.logger.error(
      `Getting custom stack state failed for stack ${stack.path}`,
      e,
    )

    throw e
  }
}

const loadCurrentCustomStacks = async (
  logger: TkmLogger,
  stacks: ReadonlyArray<InternalCustomStack>,
  customStackHandlerRegistry: CustomStackHandlerRegistry,
): Promise<Map<StackPath, CustomStackState>> => {
  logger.debug("Load current custom stacks")

  // TODO: Handle errors
  const stackMap = new Map<StackPath, CustomStackState>()
  for (const stack of stacks) {
    const handler = customStackHandlerRegistry.getHandler(stack.customType)
    const config = await parseCustomStackConfig(stack, handler)
    const state = await getCustomStackState(stack, handler, config)

    stackMap.set(stack.path, state)
  }

  return stackMap
}

export const loadCurrentStacks = async (
  logger: TkmLogger,
  stacks: ReadonlyArray<InternalStack>,
  customStackHandlerRegistry: CustomStackHandlerRegistry,
): Promise<ReadonlyArray<StackPair>> => {
  logger.info("Load current stacks")

  const standardStacks = stacks.filter(isInternalStandardStack)

  const currentStandardStacks = await loadCurrentStandardStacks(
    logger,
    standardStacks,
  )

  const customStacks = stacks.filter(isInternalCustomStack)
  const currentCustomStacks = await loadCurrentCustomStacks(
    logger,
    customStacks,
    customStackHandlerRegistry,
  )

  return stacks.map((stack) => {
    if (isInternalStandardStack(stack)) {
      return {
        stack,
        current: currentStandardStacks.get(stack.name),
      }
    }

    if (isInternalCustomStack(stack)) {
      return {
        stack,
        current: currentCustomStacks.get(stack.path),
      }
    }

    return exhaustiveCheck(stack)
  })
}
