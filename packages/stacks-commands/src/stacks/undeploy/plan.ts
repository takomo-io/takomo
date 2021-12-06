import { CloudFormationStack } from "@takomo/aws-model"
import {
  isWithinCommandPath,
  sortStacksForUndeploy,
} from "@takomo/stacks-context"
import {
  CommandPath,
  getStackPath,
  InternalStack,
  isNotObsolete,
  isObsolete,
  StackPath,
} from "@takomo/stacks-model"
import { arrayToMap } from "@takomo/util"
import R from "ramda"

export type StackUndeployOperationType = "DELETE" | "SKIP"

export const resolveUndeployOperationType = (
  currentStack?: CloudFormationStack,
): StackUndeployOperationType => (currentStack ? "DELETE" : "SKIP")

export interface StackUndeployOperation {
  readonly stack: InternalStack
  readonly type: StackUndeployOperationType
  readonly currentStack?: CloudFormationStack
}

export interface StacksUndeployPlan {
  readonly operations: ReadonlyArray<StackUndeployOperation>
  readonly prune: boolean
}

const convertToUndeployOperation = async (
  stack: InternalStack,
): Promise<StackUndeployOperation> => {
  const currentStack = await stack.getCurrentCloudFormationStack()
  const type = resolveUndeployOperationType(currentStack)
  return {
    stack,
    type,
    currentStack,
  }
}

const collectStackDependents = (
  stacksByPath: Map<StackPath, InternalStack>,
  stack: InternalStack,
): ReadonlyArray<StackPath> =>
  stack.dependents.reduce((collected, dependent) => {
    const dependentStack = stacksByPath.get(dependent)
    if (!dependentStack) {
      throw new Error(`Expected stack with path '${dependent}' to exist`)
    }

    return R.uniq([
      dependent,
      ...collected,
      ...collectStackDependents(stacksByPath, dependentStack),
    ])
  }, new Array<StackPath>())

export const buildStacksUndeployPlan = async (
  stacks: ReadonlyArray<InternalStack>,
  commandPath: CommandPath,
  ignoreDependencies: boolean,
  prune: boolean,
): Promise<StacksUndeployPlan> => {
  const pruneFilter = prune ? isObsolete : isNotObsolete
  const stacksByPath = arrayToMap(stacks, getStackPath)
  const stacksToUndeploy = stacks
    .filter((s) => isWithinCommandPath(s.path, commandPath))
    .reduce(
      (collected, stack) =>
        R.uniq([
          stack.path,
          ...collected,
          ...collectStackDependents(stacksByPath, stack),
        ]),
      new Array<StackPath>(),
    )
    .map((stackPath) => stacksByPath.get(stackPath)!)
    .filter(pruneFilter)

  const sortedStacks = sortStacksForUndeploy(stacksToUndeploy)
  const operations = await Promise.all(
    sortedStacks.map(convertToUndeployOperation),
  )

  return {
    prune,
    operations: ignoreDependencies
      ? operations.filter((o) => isWithinCommandPath(o.stack.path, commandPath))
      : operations,
  }
}
