import R from "ramda"
import { CloudFormationStack } from "../../../aws/cloudformation/model"
import { InternalStack, StackPath } from "../../../stacks/stack"
import { sortStacksForUndeploy } from "../../../takomo-stacks-context"

import {
  getStackPath,
  isNotObsolete,
  isObsolete,
  isWithinCommandPath,
} from "../../../takomo-stacks-model/util"
import { arrayToMap } from "../../../utils/collections"
import { CommandPath } from "../../command-model"

export type StackUndeployOperationType = "DELETE" | "SKIP"

export const resolveUndeployOperationType = (
  currentStack?: CloudFormationStack,
): StackUndeployOperationType => (currentStack ? "DELETE" : "SKIP")

export interface StackUndeployOperation {
  readonly stack: InternalStack
  readonly type: StackUndeployOperationType
  readonly currentStack?: CloudFormationStack
  readonly dependents: ReadonlyArray<StackPath>
}

export interface StacksUndeployPlan {
  readonly operations: ReadonlyArray<StackUndeployOperation>
  readonly prune: boolean
}

const convertToUndeployOperation = async (
  stacksByPath: Map<StackPath, InternalStack>,
  stack: InternalStack,
  prune: boolean,
): Promise<StackUndeployOperation> => {
  const currentStack = await stack.getCurrentCloudFormationStack()
  const type = resolveUndeployOperationType(currentStack)
  const dependentFilter = prune ? isObsolete : isNotObsolete
  const dependents = stack.dependents.filter((dependentPath) => {
    const dependent = stacksByPath.get(dependentPath)
    if (!dependent) {
      throw new Error(`Expected stack to exists: ${dependentPath}`)
    }

    return dependentFilter(dependent)
  })

  return {
    stack,
    type,
    dependents,
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

  const selectedStacks = ignoreDependencies
    ? sortedStacks.filter((stack) =>
        isWithinCommandPath(stack.path, commandPath),
      )
    : sortedStacks

  const operations = await Promise.all(
    selectedStacks.map((stack) =>
      convertToUndeployOperation(stacksByPath, stack, prune),
    ),
  )

  return {
    prune,
    operations,
  }
}
