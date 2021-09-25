import { CloudFormationStackSummary, StackStatus } from "@takomo/aws-model"
import {
  isWithinCommandPath,
  sortStacksForDeploy,
} from "@takomo/stacks-context"
import {
  CommandPath,
  InternalStack,
  StackOperationType,
  StackPath,
} from "@takomo/stacks-model"
import { arrayToMap, TkmLogger } from "@takomo/util"
import R from "ramda"
import {
  loadCurrentCfStacks,
  StackPair,
} from "../common/load-current-cf-stacks"

/**
 * TODO: Move somewhere else
 */
export const collectStackDependencies = (
  stacksByPath: Map<StackPath, InternalStack>,
  stack: InternalStack,
): ReadonlyArray<StackPath> =>
  stack.dependencies.reduce((collected, dependency) => {
    const dependencyStack = stacksByPath.get(dependency)
    if (!dependencyStack) {
      throw new Error(`Expected stack with path '${dependency}' to exist`)
    }

    return R.uniq([
      dependency,
      ...collected,
      ...collectStackDependencies(stacksByPath, dependencyStack),
    ])
  }, new Array<StackPath>())

export interface StackDeployOperation {
  readonly stack: InternalStack
  readonly type: StackOperationType
  readonly currentStack?: CloudFormationStackSummary
}

export interface StacksDeployPlan {
  readonly operations: ReadonlyArray<StackDeployOperation>
}

export const resolveOperationType = (
  status?: StackStatus,
): StackOperationType => {
  if (status === undefined) {
    return "CREATE"
  }

  switch (status) {
    case "CREATE_COMPLETE":
    case "UPDATE_COMPLETE":
    case "UPDATE_ROLLBACK_COMPLETE":
    case "UPDATE_ROLLBACK_FAILED":
      return "UPDATE"
    case "CREATE_FAILED":
    case "ROLLBACK_COMPLETE":
    case "ROLLBACK_FAILED":
    case "REVIEW_IN_PROGRESS":
      return "RECREATE"
    default:
      throw new Error(`Unsupported stack status: ${status}`)
  }
}

const convertToOperation = ({
  stack,
  current,
}: StackPair): StackDeployOperation => ({
  stack,
  type: resolveOperationType(current?.status),
  currentStack: current,
})

export const buildStacksDeployPlan = async (
  stacks: ReadonlyArray<InternalStack>,
  commandPath: CommandPath,
  ignoreDependencies: boolean,
  logger: TkmLogger,
): Promise<StacksDeployPlan> => {
  const stacksByPath = arrayToMap(stacks, (s) => s.path)
  const stacksToDeploy = stacks
    .filter((s) => isWithinCommandPath(s.path, commandPath))
    .reduce(
      (collected, stack) =>
        R.uniq([
          stack.path,
          ...collected,
          ...collectStackDependencies(stacksByPath, stack),
        ]),
      new Array<StackPath>(),
    )
    .map((stackPath) => stacksByPath.get(stackPath)!)

  const sortedStacks = sortStacksForDeploy(stacksToDeploy)
  const stackPairs = await loadCurrentCfStacks(logger, sortedStacks)
  const operations = stackPairs.map(convertToOperation)

  return {
    operations: ignoreDependencies
      ? operations.filter((o) => isWithinCommandPath(o.stack.path, commandPath))
      : operations,
  }
}
