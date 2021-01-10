import { CloudFormationStack } from "@takomo/aws-model"
import {
  isWithinCommandPath,
  sortStacksForUndeploy,
} from "@takomo/stacks-context"
import { CommandPath, InternalStack } from "@takomo/stacks-model"

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

/**
 * @hidden
 */
export const buildStacksUndeployPlan = async (
  stacks: ReadonlyArray<InternalStack>,
  commandPath: CommandPath,
  ignoreDependencies: boolean,
): Promise<StacksUndeployPlan> => {
  const sortedStacks = sortStacksForUndeploy(stacks)
  const operations = await Promise.all(
    sortedStacks.map(convertToUndeployOperation),
  )

  return {
    operations: ignoreDependencies
      ? operations.filter((o) => isWithinCommandPath(o.stack.path, commandPath))
      : operations,
  }
}
