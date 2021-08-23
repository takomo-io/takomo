import { CloudFormationStack } from "@takomo/aws-model"
import {
  isWithinCommandPath,
  sortStacksForUndeploy,
} from "@takomo/stacks-context"
import { CommandPath, InternalStack, StackPath } from "@takomo/stacks-model"
import { TkmLogger } from "@takomo/util"
import R from "ramda"
import {
  loadCurrentCfStacks,
  StackPair,
} from "../common/load-current-cf-stacks"

/**
 * @hidden
 */
export type StackUndeployOperationType = "DELETE" | "SKIP"

/**
 * @hidden
 */
export const resolveUndeployOperationType = (
  currentStack?: CloudFormationStack,
): StackUndeployOperationType => (currentStack ? "DELETE" : "SKIP")

/**
 * @hidden
 */
export interface StackUndeployOperation {
  readonly stack: InternalStack
  readonly type: StackUndeployOperationType
  readonly currentStack?: CloudFormationStack
}

/**
 * @hidden
 */
export interface StacksUndeployPlan {
  readonly operations: ReadonlyArray<StackUndeployOperation>
}

const convertToUndeployOperation = ({
  stack,
  current,
}: StackPair): StackUndeployOperation => ({
  stack,
  type: resolveUndeployOperationType(current),
  currentStack: current,
})

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

/**
 * @hidden
 */
export const buildStacksUndeployPlan = async (
  stacks: ReadonlyArray<InternalStack>,
  commandPath: CommandPath,
  ignoreDependencies: boolean,
  logger: TkmLogger,
): Promise<StacksUndeployPlan> => {
  const stacksByPath = new Map(stacks.map((s) => [s.path, s]))
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

  const sortedStacks = sortStacksForUndeploy(stacksToUndeploy)
  const stackPairs = await loadCurrentCfStacks(logger, sortedStacks)
  const operations = stackPairs.map(convertToUndeployOperation)

  return {
    operations: ignoreDependencies
      ? operations.filter((o) => isWithinCommandPath(o.stack.path, commandPath))
      : operations,
  }
}
