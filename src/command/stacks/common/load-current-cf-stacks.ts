import {
  CloudFormationStackSummary,
  StackName,
} from "../../../aws/cloudformation/model.js"
import { InternalStack } from "../../../stacks/stack.js"
import { getStackNames } from "../../../takomo-stacks-model/util.js"
import { arrayToMap } from "../../../utils/collections.js"
import { TkmLogger } from "../../../utils/logging.js"
import { checksum } from "../../../utils/strings.js"

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
  stacks: ReadonlyArray<InternalStack>,
): Promise<Map<StackName, CloudFormationStackSummary>> => {
  const stackNames = getStackNames(stacks)
  return stacks[0]
    .getCloudFormationClient()
    .then((client) => client.listNotDeletedStacks(stackNames))
}

export interface StackPair {
  readonly stack: InternalStack
  readonly current?: CloudFormationStackSummary
}

const buildHashStackMap = (
  stackHashPairs: ReadonlyArray<[string, InternalStack]>,
): Map<string, InternalStack[]> => {
  const stackHashMap = new Map<string, InternalStack[]>()
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

export const loadCurrentCfStacks = async (
  logger: TkmLogger,
  stacks: ReadonlyArray<InternalStack>,
): Promise<ReadonlyArray<StackPair>> => {
  logger.info("Load current stacks")

  const stackHashPairs: ReadonlyArray<[string, InternalStack]> =
    await Promise.all(
      stacks.map(async (stack) => {
        const hash = await makeCredentialsRegionHash(stack)
        return [hash, stack]
      }),
    )

  const stackHashMap = buildHashStackMap(stackHashPairs)

  const pairs = await Promise.all(
    Array.from(stackHashMap.values()).map(async (stacks) => {
      const cfStacks = await loadCfStacks(stacks)
      return stacks.map((stack) => ({
        stack,
        current: cfStacks.get(stack.name),
      }))
    }),
  )

  const pairsByPath = arrayToMap(pairs.flat(), (p) => p.stack.path)

  return stacks.map((stack) => pairsByPath.get(stack.path)!)
}
