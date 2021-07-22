import { CloudFormationStack, StackStatus } from "@takomo/aws-model"
import {
  isWithinCommandPath,
  sortStacksForDeploy,
} from "@takomo/stacks-context"
import { CommandPath, InternalStack, StackPath } from "@takomo/stacks-model"
import { arrayToMap } from "@takomo/util"
import R from "ramda"

/**
 * TODO: Move somewhere else
 * @hidden
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

/**
 * @hidden
 */
export type StackDeployOperationType = "CREATE" | "RECREATE" | "UPDATE"

/**
 * @hidden
 */
export interface StackDeployOperation {
  readonly stack: InternalStack
  readonly type: StackDeployOperationType
  readonly currentStack?: CloudFormationStack
}

/**
 * @hidden
 */
export interface StacksDeployPlan {
  readonly operations: ReadonlyArray<StackDeployOperation>
}

/**
 * @hidden
 */
export const resolveOperationType = (
  status?: StackStatus,
): StackDeployOperationType => {
  if (status === undefined) {
    return "CREATE"
  }

  switch (status) {
    case "CREATE_COMPLETE":
    case "UPDATE_COMPLETE":
    case "UPDATE_ROLLBACK_COMPLETE":
      return "UPDATE"
    case "CREATE_FAILED":
    case "ROLLBACK_COMPLETE":
    case "REVIEW_IN_PROGRESS":
      return "RECREATE"
    default:
      throw new Error(`Unsupported stack status: ${status}`)
  }
}

const convertToOperation = async (
  stack: InternalStack,
): Promise<StackDeployOperation> => {
  const currentStack = await stack.getCurrentCloudFormationStack()
  const type = resolveOperationType(currentStack?.status)
  return {
    stack,
    type,
    currentStack,
  }
}

/**
 * @hidden
 */
export const buildStacksDeployPlan = async (
  stacks: ReadonlyArray<InternalStack>,
  commandPath: CommandPath,
  ignoreDependencies: boolean,
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
  const operations = await Promise.all(sortedStacks.map(convertToOperation))

  return {
    operations: ignoreDependencies
      ? operations.filter((o) => isWithinCommandPath(o.stack.path, commandPath))
      : operations,
  }
}
