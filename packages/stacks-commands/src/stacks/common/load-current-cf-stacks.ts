import { CloudFormationStack, StackName } from "@takomo/aws-model"
import { getStackNames, InternalStack } from "@takomo/stacks-model"
import { checksum, TkmLogger } from "@takomo/util"
import R from "ramda"

const makeCredentialsRegionHash = ({
  region,
  credentials: { accessKeyId, secretAccessKey, sessionToken },
}: InternalStack): string =>
  checksum([region, accessKeyId, secretAccessKey, sessionToken].join(":"))

const loadCfStacks = (
  stacks: ReadonlyArray<InternalStack>,
): Promise<Map<StackName, CloudFormationStack>> => {
  const stackNames = getStackNames(stacks)
  return stacks[0].getCloudFormationClient().describeStacks(stackNames)
}

interface StackPair {
  readonly stack: InternalStack
  readonly current?: CloudFormationStack
}

export const loadCurrentCfStacks = async (
  logger: TkmLogger,
  stacks: ReadonlyArray<InternalStack>,
): Promise<ReadonlyArray<StackPair>> => {
  logger.info("Load current stacks")
  const stacksByHash = R.groupBy(makeCredentialsRegionHash, stacks)
  const pairs = await Promise.all(
    Object.values(stacksByHash).map(async (stacks) => {
      const cfStacks = await loadCfStacks(stacks)
      return stacks.map((stack) => ({
        stack,
        current: cfStacks.get(stack.name),
      }))
    }),
  )

  return pairs.flat()
}
