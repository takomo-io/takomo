import { InternalStacksContext } from "../../../context/stacks-context.js"
import { Timer } from "../../../utils/timer.js"
import { StackResult } from "../../command-model.js"
import { StacksOperationListener } from "../common/model.js"
import { executeSteps } from "../common/steps.js"
import { UndeployStacksIO } from "./model.js"
import {
  CustomStackUndeployOperation,
  isCustomStackUndeployOperation,
  isStandardStackUndeployOperation,
  StackUndeployOperation,
  StandardStackUndeployOperation,
} from "./plan.js"
import { InitialUndeployStackState } from "./states.js"
import { createUndeployStackTransitions } from "./transitions.js"

const deleteStandardStack = async (
  timer: Timer,
  ctx: InternalStacksContext,
  io: UndeployStacksIO,
  operation: StandardStackUndeployOperation,
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

const deleteCustomStack = async (
  timer: Timer,
  ctx: InternalStacksContext,
  io: UndeployStacksIO,
  operation: CustomStackUndeployOperation,
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

export const deleteStack = async (
  timer: Timer,
  ctx: InternalStacksContext,
  io: UndeployStacksIO,
  operation: StackUndeployOperation,
  dependents: Promise<StackResult>[],
  stacksOperationListener: StacksOperationListener,
): Promise<StackResult> => {
  if (isStandardStackUndeployOperation(operation)) {
    return deleteStandardStack(
      timer,
      ctx,
      io,
      operation,
      dependents,
      stacksOperationListener,
    )
  }

  if (isCustomStackUndeployOperation(operation)) {
    return deleteCustomStack(
      timer,
      ctx,
      io,
      operation,
      dependents,
      stacksOperationListener,
    )
  }

  throw new Error("Unsupported stack undeploy operation")
}
