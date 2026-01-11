import {
  CloudFormationStackSummary,
  StackName,
} from "../../../aws/cloudformation/model.js"
import {
  InternalCustomStack,
  isInternalCustomStack,
} from "../../../stacks/custom-stack.js"
import { InternalStack, StackUuid } from "../../../stacks/stack.js"
import {
  InternalStandardStack,
  isInternalStandardStack,
} from "../../../stacks/standard-stack.js"
import { TkmLogger } from "../../../utils/logging.js"
import { checksum } from "../../../utils/strings.js"
import { CustomStackState } from "../../../custom-stacks/custom-stack-handler.js"
import { exhaustiveCheck } from "../../../utils/exhaustive-check.js"
import { StacksContext } from "../../../index.js"

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

export type CustomStackPair = {
  readonly stack: InternalCustomStack
  readonly currentState: CustomStackState
}

export type StandardStackPair = {
  readonly stack: InternalStandardStack
  readonly currentStack?: CloudFormationStackSummary
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

export const loadCurrentStandardStacks = async (
  logger: TkmLogger,
  stacks: ReadonlyArray<InternalStandardStack>,
): Promise<Map<StackUuid, CloudFormationStackSummary | undefined>> => {
  logger.debug("Load current standard stacks")

  const stackHashPairs: ReadonlyArray<[string, InternalStandardStack]> =
    await Promise.all(
      stacks.map(async (stack) => {
        const hash = await makeCredentialsRegionHash(stack)
        return [hash, stack]
      }),
    )

  const stackHashMap = buildHashStackMap(stackHashPairs)

  const pairs = await Promise.all(
    Array.from(stackHashMap.values()).map(async (stacksWithSameCredentials) => {
      const cfStacks = await loadCfStacks(stacksWithSameCredentials)
      return stacksWithSameCredentials.map((stack) => ({
        stack,
        current: cfStacks.get(stack.name),
      }))
    }),
  )

  return new Map(
    pairs.flat().map((p) => {
      return [p.stack.uuid, p.current] as const
    }),
  )
}

export const getCustomStackState = async (
  ctx: StacksContext,
  stack: InternalCustomStack,
): Promise<CustomStackState> => {
  const { customStackHandler, customConfig, logger, path } = stack

  if (!customStackHandler.getCurrentState) {
    logger.debug(
      `Custom stack handler '${customStackHandler.type}' does not implement getCurrentState() for stack ${path}, returning UNKNOWN state`,
    )
    return { status: "UNKNOWN" }
  }

  try {
    const result = await customStackHandler.getCurrentState({
      logger,
      config: customConfig,
      stack,
      ctx,
    })

    if (result.success) {
      return result.currentState ?? { status: "PENDING" }
    }

    const { message, error } = result

    logger.error(
      `Getting custom stack state failed for stack ${path}: ${message}`,
      error,
    )
    throw new Error(`Getting custom stack state failed for stack ${path}`)
  } catch (e) {
    logger.error(`Getting custom stack state failed for stack ${path}`, e)
    throw e
  }
}

const loadCurrentCustomStacks = async (
  logger: TkmLogger,
  stacks: ReadonlyArray<InternalCustomStack>,
  ctx: StacksContext,
): Promise<Map<StackUuid, CustomStackState>> => {
  logger.debug("Load current custom stacks")

  // TODO: Handle errors
  const stackMap = new Map<StackUuid, CustomStackState>()
  for (const stack of stacks) {
    const state = await getCustomStackState(ctx, stack)

    stackMap.set(stack.uuid, state)
  }

  return stackMap
}

export const loadCurrentStacks = async (
  logger: TkmLogger,
  stacks: ReadonlyArray<InternalStack>,
  ctx: StacksContext,
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
    ctx,
  )

  const stackPairs: ReadonlyArray<StackPair> = stacks.map((stack) => {
    if (isInternalStandardStack(stack)) {
      return {
        stack,
        currentStack: currentStandardStacks.get(stack.uuid),
      }
    }

    if (isInternalCustomStack(stack)) {
      const currentState = currentCustomStacks.get(stack.uuid)
      if (!currentState) {
        throw new Error(
          `Expected current state to exist for custom stack: ${stack.path}`,
        )
      }

      return {
        stack,
        currentState,
      }
    }

    return exhaustiveCheck(stack)
  })

  return stackPairs
}
