import { InternalStacksContext } from "../../../context/stacks-context.js"
import { InternalStack } from "../../../stacks/stack.js"
import { StacksConfigRepository } from "../../../takomo-stacks-context/model.js"
import { TkmLogger } from "../../../utils/logging.js"
import { Timer } from "../../../utils/timer.js"
import { StackResult } from "../../command-model.js"
import { StacksOperationListener } from "../common/model.js"
import { executeSteps } from "../common/steps.js"
import { InitialDeployCustomStackState } from "./custom-stack/states.js"
import { createDeployCustomStackTransitions } from "./custom-stack/transitions.js"
import { DeployStacksIO, DeployState } from "./model.js"
import {
  isCustomStackDeployOperation,
  isStandardStackDeployOperation,
  StackDeployOperation,
} from "./plan.js"
import { InitialDeployStandardStackState } from "./standard-stack/states.js"
import { createDeployStackTransitions } from "./standard-stack/transitions.js"

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
  operation: StackDeployOperation,
  timer: Timer,
  ctx: InternalStacksContext,
  io: DeployStacksIO,
  state: DeployState,
  // stack: InternalStack,
  dependencies: Promise<StackResult>[],
  // operationType: StackOperationType,
  configRepository: StacksConfigRepository,
  stacksOperationListener: StacksOperationListener,
  expectNoChanges: boolean,
  emit: boolean,
  skipHooks: boolean,
  skipParameters: boolean,
  outDir?: string,
  // currentStack?: CloudFormationStackSummary,
): Promise<StackResult> => {
  const logger = io.childLogger(operation.stack.path)

  if (isStandardStackDeployOperation(operation)) {
    const { currentStack, stack, type } = operation
    logStackConfig(logger, stack, ctx.confidentialValuesLoggingEnabled)

    const variables = {
      ...ctx.variables,
      hooks: {},
    }

    if (currentStack) {
      logger.info(`Stack status: ${currentStack.status}`)
    } else {
      logger.info(`Stack status: PENDING`)
    }

    const initialState: InitialDeployStandardStackState = {
      io,
      stack,
      variables,
      logger,
      dependencies,
      operationType: type,
      state,
      currentStack,
      ctx,
      configRepository,
      stacksOperationListener,
      expectNoChanges,
      emit,
      skipHooks,
      skipParameters,
      stackExistedBeforeOperation: currentStack !== undefined,
      totalTimer: timer.startChild(stack.path),
      transitions: createDeployStackTransitions(),
      outDir,
    }

    return executeSteps(initialState)
  }

  if (isCustomStackDeployOperation(operation)) {
    const { currentState, stack, type } = operation
    logStackConfig(logger, stack, ctx.confidentialValuesLoggingEnabled)

    const variables = {
      ...ctx.variables,
      hooks: {},
    }

    logger.info(`Stack status: ${currentState.status}`)

    const handler = ctx.customStackHandlerRegistry.getHandler(stack.customType)

    const initialState: InitialDeployCustomStackState = {
      io,
      stack,
      variables,
      logger,
      dependencies,
      operationType: type,
      state,
      currentStatus: currentState,
      ctx,
      emit,
      expectNoChanges,
      stacksOperationListener,
      stackExistedBeforeOperation: currentState !== undefined,
      totalTimer: timer.startChild(stack.path),
      transitions: createDeployCustomStackTransitions(),
      customStackHandler: handler,
    }

    return executeSteps(initialState)
  }

  throw new Error(`Unknown stack type`)
}
