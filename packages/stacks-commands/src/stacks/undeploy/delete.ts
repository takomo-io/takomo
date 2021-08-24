import { InternalStacksContext, StackResult } from "@takomo/stacks-model"
import { Timer } from "@takomo/util"
import { StacksOperationListener } from "../common/model"
import { executeSteps } from "../common/steps"
import { UndeployStacksIO } from "./model"
import { StackUndeployOperation } from "./plan"
import { InitialUndeployStackState } from "./states"
import { createUndeployStackTransitions } from "./transitions"

/**
 * @hidden
 */
export const deleteStack = async (
  timer: Timer,
  ctx: InternalStacksContext,
  io: UndeployStacksIO,
  operation: StackUndeployOperation,
  dependents: Promise<StackResult>[],
  stacksOperationListener: StacksOperationListener,
): Promise<StackResult> => {
  const { stack, currentStack } = operation
  const logger = io.childLogger(operation.stack.path)

  const variables = {
    ...ctx.variables,
    hooks: {},
  }

  const initial: InitialUndeployStackState = {
    ctx,
    stack,
    io,
    logger,
    variables,
    dependents,
    currentStack,
    stacksOperationListener,
    stackExistedBeforeOperation: currentStack !== undefined,
    operationType: "DELETE",
    totalTimer: timer.startChild(stack.path),
    transitions: createUndeployStackTransitions(),
  }

  return executeSteps(initial)
}
