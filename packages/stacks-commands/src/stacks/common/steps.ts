import { StackResult } from "@takomo/stacks-model"
import { TkmLogger } from "@takomo/util"
import { InitialStackOperationState } from "./states"

type StackOperationCompletedProps = Omit<StackResult, "timer">

/**
 * @hidden
 */
export class StackOperationCompleted {
  readonly completed = true
  readonly props: StackOperationCompletedProps

  constructor(props: StackOperationCompletedProps) {
    this.props = props
  }
}

interface StackOperationInProgressProps<S extends InitialStackOperationState> {
  readonly stepName: string
  readonly step: StackOperationStep<S>
  readonly state: S
}

/**
 * @hidden
 */
export class StackOperationInProgress<S extends InitialStackOperationState> {
  readonly completed = false
  readonly stepName: string
  readonly step: StackOperationStep<S>
  readonly state: S

  constructor({ step, stepName, state }: StackOperationInProgressProps<S>) {
    this.step = step
    this.stepName = stepName
    this.state = state
  }
}

/**
 * @hidden
 */
export type StepResult = StackOperationInProgress<any> | StackOperationCompleted

/**
 * @hidden
 */
export type StackOperationStep<S extends InitialStackOperationState> = (
  state: S,
) => Promise<StepResult>

const executeStep = async <S extends InitialStackOperationState>(
  logger: TkmLogger,
  stepName: string,
  step: StackOperationStep<S>,
  state: S,
): Promise<StepResult> => {
  logger.trace(`Begin step '${stepName}'`)
  const timer = state.totalTimer.startChild(stepName)
  try {
    return await step(state)
  } catch (error) {
    logger.error(`Unhandled error in step '${stepName}':`, error)
    return new StackOperationCompleted({
      stack: state.stack,
      message: "Error",
      status: "FAILED",
      events: [],
      success: false,
      error,
    })
  } finally {
    timer.stop()
    logger.trace(
      `Step '${stepName}' completed in ${timer.getSecondsElapsed()}ms`,
    )
  }
}

/**
 * @hidden
 */
export const executeSteps = async (
  state: InitialStackOperationState,
): Promise<StackResult> => {
  const { transitions, totalTimer, stack } = state
  const logger = stack.logger

  let result = await transitions.start(state)
  while (!result.completed) {
    result = await executeStep(
      logger,
      result.stepName,
      result.step,
      result.state,
    )
  }

  totalTimer.stop()
  return { ...result.props, timer: totalTimer }
}
