import {
  CloudFormationStackSummary,
  StackName,
} from "../../../aws/cloudformation/model.js"
import { CustomStackHandlerRegistry } from "../../../custom-stack-handler/custom-stack-handler-registry.js"
import {
  CustomStack,
  InternalCustomStack,
  isInternalCustomStack,
} from "../../../stacks/custom-stack.js"
import { InternalStack, StackPath } from "../../../stacks/stack.js"
import {
  InternalStandardStack,
  isInternalStandardStack,
} from "../../../stacks/standard-stack.js"
import { arrayToMap } from "../../../utils/collections.js"
import { TkmLogger } from "../../../utils/logging.js"
import { checksum } from "../../../utils/strings.js"
import { CustomStackState } from "../../../stacks/custom-stack.js"

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

  console.log(JSON.stringify(stacks, undefined, 2))

  const stackHashPairs: ReadonlyArray<[string, InternalStandardStack]> =
    await Promise.all(
      stacks.map(async (stack) => {
        const hash = await makeCredentialsRegionHash(stack)
        return [hash, stack]
      }),
    )

  const stackHashMap = buildHashStackMap(stackHashPairs)

  const stackMap = new Map<StackPath, CloudFormationStackSummary>()
  console.log("stacksWithSameCredentials-----")
  for (const stacksWithSameCredentials of stackHashMap.values()) {
    stacksWithSameCredentials.forEach((s) => {
      console.log(JSON.stringify(s, undefined, 2))
    })

    const cfStacks = await loadCfStacks(stacksWithSameCredentials)
    for (const [stackPath, cfStack] of cfStacks) {
      stackMap.set(stackPath, cfStack)
    }
  }

  return stackMap
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
    const handler = await customStackHandlerRegistry.getHandler(stack.type)
    const state = await handler.getCurrentState({
      logger: stack.logger,
      config: stack.config,
    })

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
        current: currentStandardStacks.get(stack.path),
      }
    } else if (isInternalCustomStack(stack)) {
      return {
        stack,
        current: currentCustomStacks.get(stack.path),
      }
    }

    throw new Error("Unknown stack type")
  })
}
