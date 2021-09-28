import { StackName } from "@takomo/aws-model"
import { CloudFormationStackSummary } from "@takomo/aws-model/src/cloudformation"
import { getStackNames, InternalStack } from "@takomo/stacks-model"
import { arrayToMap, checksum, TkmLogger } from "@takomo/util"
import R from "ramda"

const makeCredentialsRegionHash = ({
  region,
  credentials: { accessKeyId, secretAccessKey, sessionToken },
}: InternalStack): string =>
  checksum([region, accessKeyId, secretAccessKey, sessionToken].join(":"))

const loadCfStacks = (
  stacks: ReadonlyArray<InternalStack>,
): Promise<Map<StackName, CloudFormationStackSummary>> => {
  const stackNames = getStackNames(stacks)
  return stacks[0].getCloudFormationClient().listNotDeletedStacks(stackNames)
}

export interface StackPair {
  readonly stack: InternalStack
  readonly current?: CloudFormationStackSummary
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

  const pairsByPath = arrayToMap(pairs.flat(), (p) => p.stack.path)

  return stacks.map((stack) => pairsByPath.get(stack.path)!)
}
