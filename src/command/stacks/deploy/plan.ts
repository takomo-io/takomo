import * as R from "ramda"
import {
  CloudFormationStackSummary,
  StackStatus,
} from "../../../aws/cloudformation/model.js"
import {
  InternalStandardStack,
  isInternalStandardStack,
} from "../../../stacks/standard-stack.js"
import { sortStacksForDeploy } from "../../../takomo-stacks-context/dependencies.js"
import {
  isNotObsolete,
  isWithinCommandPath,
} from "../../../takomo-stacks-model/util.js"
import { arrayToMap } from "../../../utils/collections.js"
import { TkmLogger } from "../../../utils/logging.js"
import { CommandPath, StackOperationType } from "../../command-model.js"
import {
  isCustomStackPair,
  isStandardStackPair,
  loadCurrentStacks,
  StackPair,
} from "../common/load-current-cf-stacks.js"
import { InternalStack, StackPath } from "../../../stacks/stack.js"
import {
  InternalCustomStack,
  isInternalCustomStack,
} from "../../../stacks/custom-stack.js"
import { CustomStackState } from "../../../custom-stacks/custom-stack-handler.js"
import { StacksContext } from "../../../index.js"
import { exhaustiveCheck } from "../../../utils/exhaustive-check.js"

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

export interface StandardStackDeployOperation {
  readonly stack: InternalStandardStack
  readonly type: StackOperationType
  readonly currentStack?: CloudFormationStackSummary
  readonly stackExistedBeforeOperation: boolean
}

export interface CustomStackDeployOperation {
  readonly stack: InternalCustomStack
  readonly type: StackOperationType
  readonly currentState: CustomStackState
  readonly stackExistedBeforeOperation: boolean
}

export type StackDeployOperation =
  | StandardStackDeployOperation
  | CustomStackDeployOperation

export const isStandardStackDeployOperation = (
  op: StackDeployOperation,
): op is StandardStackDeployOperation => isInternalStandardStack(op.stack)

export const isCustomStackDeployOperation = (
  op: StackDeployOperation,
): op is CustomStackDeployOperation => isInternalCustomStack(op.stack)

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
    case "IMPORT_COMPLETE":
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

const convertToOperation = (pair: StackPair): StackDeployOperation => {
  if (isStandardStackPair(pair)) {
    return {
      stack: pair.stack,
      type: resolveOperationType(pair.currentStack?.status),
      currentStack: pair.currentStack,
      stackExistedBeforeOperation: pair.currentStack !== undefined,
    }
  }

  if (isCustomStackPair(pair)) {
    return {
      stack: pair.stack,
      type: pair.currentState?.status === "PENDING" ? "CREATE" : "UPDATE",
      currentState: pair.currentState,
      stackExistedBeforeOperation: pair.currentState.status !== "PENDING",
    }
  }

  return exhaustiveCheck(pair)
}

export const buildStacksDeployPlan = async (
  stacks: ReadonlyArray<InternalStack>,
  commandPath: CommandPath,
  ignoreDependencies: boolean,
  logger: TkmLogger,
  ctx: StacksContext,
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
    .filter(isNotObsolete)

  const sortedStacks = sortStacksForDeploy(stacksToDeploy)
  const stackPairs = await loadCurrentStacks(logger, sortedStacks, ctx)
  const operations = stackPairs.map(convertToOperation)

  return {
    operations: ignoreDependencies
      ? operations.filter((o) => isWithinCommandPath(o.stack.path, commandPath))
      : operations,
  }
}
