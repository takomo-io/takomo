import { CloudFormationStack, StackStatus } from "@takomo/aws-model"
import {
  isWithinCommandPath,
  sortStacksForDeploy,
} from "@takomo/stacks-context"
import { CommandPath, InternalStack } from "@takomo/stacks-model"

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
  const sortedStacks = sortStacksForDeploy(stacks)
  const operations = await Promise.all(sortedStacks.map(convertToOperation))

  return {
    operations: ignoreDependencies
      ? operations.filter((o) => isWithinCommandPath(o.stack.path, commandPath))
      : operations,
  }
}
