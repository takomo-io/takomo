import * as R from "ramda"
import { CloudFormationStack } from "../../../aws/cloudformation/model.js"
import {
  InternalStandardStack,
  isStandardStack,
} from "../../../stacks/standard-stack.js"
import {
  getStackPath,
  isNotObsolete,
  isObsolete,
  isWithinCommandPath,
} from "../../../takomo-stacks-model/util.js"
import { arrayToMap } from "../../../utils/collections.js"
import { CommandPath } from "../../command-model.js"
import { sortStacksForUndeploy } from "../../../takomo-stacks-context/dependencies.js"
import { InternalStack, StackPath } from "../../../stacks/stack.js"
import {
  InternalCustomStack,
  isCustomStack,
} from "../../../stacks/custom-stack.js"

export type StackUndeployOperationType = "DELETE" | "SKIP"

export const resolveUndeployOperationType = (
  currentStack?: unknown,
): StackUndeployOperationType => (currentStack ? "DELETE" : "SKIP")

export interface StandardStackUndeployOperation {
  readonly stack: InternalStandardStack
  readonly type: StackUndeployOperationType
  readonly currentStack?: CloudFormationStack
  readonly dependents: ReadonlyArray<StackPath>
}

export interface CustomStackUndeployOperation {
  readonly stack: InternalCustomStack
  readonly type: StackUndeployOperationType
  readonly currentStack?: unknown // TODO: Set type when implemented
  readonly dependents: ReadonlyArray<StackPath>
}

export type StackUndeployOperation =
  | StandardStackUndeployOperation
  | CustomStackUndeployOperation

export const isStandardStackUndeployOperation = (
  op: StackUndeployOperation,
): op is StandardStackUndeployOperation => isStandardStack(op.stack)

export const isCustomStackUndeployOperation = (
  op: StackUndeployOperation,
): op is CustomStackUndeployOperation => isCustomStack(op.stack)

export interface StacksUndeployPlan {
  readonly operations: ReadonlyArray<StackUndeployOperation>
  readonly prune: boolean
}

const convertToUndeployOperation = async (
  stacksByPath: Map<StackPath, InternalStack>,
  stack: InternalStack,
  prune: boolean,
): Promise<StackUndeployOperation> => {
  const dependentFilter = prune ? isObsolete : isNotObsolete
  const dependents = stack.dependents.filter((dependentPath) => {
    const dependent = stacksByPath.get(dependentPath)
    if (!dependent) {
      throw new Error(`Expected stack to exists: ${dependentPath}`)
    }

    return dependentFilter(dependent)
  })

  if (isCustomStack(stack)) {
    const currentStack = undefined // TODO: Implement when custom stacks are supported
    const type = resolveUndeployOperationType(currentStack)

    return {
      stack,
      type,
      dependents,
      currentStack,
    }
  }

  if (isStandardStack(stack)) {
    const currentStack = await stack.getCurrentCloudFormationStack()
    const type = resolveUndeployOperationType(currentStack)

    return {
      stack,
      type,
      dependents,
      currentStack,
    }
  }

  throw new Error("Unknown stack type")
}

const collectStackDependents = (
  stacksByPath: Map<StackPath, InternalStandardStack>,
  stack: InternalStandardStack,
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
  stacks: ReadonlyArray<InternalStandardStack>,
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
