import { InternalStacksContext, StackResult } from "@takomo/stacks-model"
import { Timer } from "@takomo/util"
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
    totalTimer: timer.startChild(stack.path),
    transitions: createUndeployStackTransitions(),
  }

  return executeSteps(initial)
}
