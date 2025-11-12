import { InternalStacksContext } from "../../../context/stacks-context.js"
import { Timer } from "../../../utils/timer.js"
import { StackResult } from "../../command-model.js"
import { StacksOperationListener } from "../common/model.js"
import { executeSteps } from "../common/steps.js"
import { InitialUndeployCustomStackState } from "./custom-stack/states.js"
import { createUndeployCustomStackTransitions } from "./custom-stack/transitions.js"
import { UndeployStacksIO } from "./model.js"
import {
  isStandardStackUndeployOperation,
  StackUndeployOperation,
} from "./plan.js"
import { InitialUndeployStandardStackState } from "./standard-stack/states.js"
import { createUndeployStackTransitions } from "./standard-stack/transitions.js"

export const deleteStack = async (
  timer: Timer,
  ctx: InternalStacksContext,
  io: UndeployStacksIO,
  operation: StackUndeployOperation,
  dependents: Promise<StackResult>[],
  stacksOperationListener: StacksOperationListener,
): Promise<StackResult> => {
  const logger = io.childLogger(operation.stack.path)

  const variables = {
    ...ctx.variables,
    hooks: {},
  }

  if (isStandardStackUndeployOperation(operation)) {
    const { stack, currentStack } = operation
    const initial: InitialUndeployStandardStackState = {
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
  } else {
    const { stack, currentStack } = operation
    const initial: InitialUndeployCustomStackState = {
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
      transitions: createUndeployCustomStackTransitions(),
      customStackHandler: operation.customStackHandler,
    }

    return executeSteps(initial)
  }
}
