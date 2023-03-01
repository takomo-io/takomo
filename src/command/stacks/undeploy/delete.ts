import { InternalStacksContext } from "../../../context/stacks-context.js"
import { Timer } from "../../../utils/timer.js"
import { StackResult } from "../../command-model.js"
import { StacksOperationListener } from "../common/model.js"
import { executeSteps } from "../common/steps.js"
import { UndeployStacksIO } from "./model.js"
import { StackUndeployOperation } from "./plan.js"
import { InitialUndeployStackState } from "./states.js"
import { createUndeployStackTransitions } from "./transitions.js"

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
