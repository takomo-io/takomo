import { CloudFormationStack } from "@takomo/aws-model"
import { StacksConfigRepository } from "@takomo/stacks-context"
import {
  InternalStack,
  InternalStacksContext,
  StackResult,
} from "@takomo/stacks-model"
import { Timer } from "@takomo/util"
import { executeSteps } from "../common/steps"
import { DeployStacksIO, DeployState } from "./model"
import { StackDeployOperationType } from "./plan"
import { InitialDeployStackState } from "./states"
import { createDeployStackTransitions } from "./transitions"

/**
 * @hidden
 */
export const deployStack = async (
  timer: Timer,
  ctx: InternalStacksContext,
  io: DeployStacksIO,
  state: DeployState,
  stack: InternalStack,
  dependencies: Promise<StackResult>[],
  operationType: StackDeployOperationType,
  configRepository: StacksConfigRepository,
  currentStack?: CloudFormationStack,
): Promise<StackResult> => {
  const logger = io.childLogger(stack.path)

  if (currentStack) {
    logger.info(`Stack status: ${currentStack.status}`)
  } else {
    logger.info(`Stack status: PENDING`)
  }

  logger.debugObject("Stack config:", () => stack)

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
    totalTimer: timer.startChild(stack.path),
    transitions: createDeployStackTransitions(),
  }

  return executeSteps(initialState)
}
