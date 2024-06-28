import { CloudFormationStackSummary } from "../../../aws/cloudformation/model.js"
import { InternalStacksContext } from "../../../context/stacks-context.js"
import { InternalStack } from "../../../stacks/stack.js"
import { StacksConfigRepository } from "../../../takomo-stacks-context/model.js"
import { TkmLogger } from "../../../utils/logging.js"
import { Timer } from "../../../utils/timer.js"
import { StackOperationType, StackResult } from "../../command-model.js"
import { StacksOperationListener } from "../common/model.js"
import { executeSteps } from "../common/steps.js"
import { DeployStacksIO, DeployState } from "./model.js"
import { InitialDeployStackState } from "./states.js"
import { createDeployStackTransitions } from "./transitions.js"

const logStackConfig = (
  logger: TkmLogger,
  stack: InternalStack,
  confidentialValuesLoggingEnabled: boolean,
): void => {
  const filterFn = confidentialValuesLoggingEnabled
    ? () => stack
    : () => ({ ...stack, credentials: "*****" })
  logger.debugObject("Stack config:", () => stack, filterFn)
}

export const deployStack = async (
  timer: Timer,
  ctx: InternalStacksContext,
  io: DeployStacksIO,
  state: DeployState,
  stack: InternalStack,
  dependencies: Promise<StackResult>[],
  operationType: StackOperationType,
  configRepository: StacksConfigRepository,
  stacksOperationListener: StacksOperationListener,
  expectNoChanges: boolean,
  currentStack?: CloudFormationStackSummary,
): Promise<StackResult> => {
  const logger = io.childLogger(stack.path)

  if (currentStack) {
    logger.info(`Stack status: ${currentStack.status}`)
  } else {
    logger.info(`Stack status: PENDING`)
  }

  logStackConfig(logger, stack, ctx.confidentialValuesLoggingEnabled)

  const variables = {
    ...ctx.variables,
    hooks: {},
  }

  const initialState: InitialDeployStackState = {
    io,
    stack,
    variables,
    logger,
    dependencies,
    operationType,
    state,
    currentStack,
    ctx,
    configRepository,
    stacksOperationListener,
    expectNoChanges,
    stackExistedBeforeOperation: currentStack !== undefined,
    totalTimer: timer.startChild(stack.path),
    transitions: createDeployStackTransitions(),
  }

  return executeSteps(initialState)
}
