import { TkmLogger } from "@takomo/util"
import { DeployOrganizationOutput } from "./model"
import { InitialDeployOrganizationState } from "./states"
import {
  OrganizationDeployCompleted,
  OrganizationDeployInProgress,
} from "./transitions"

export type StepResult =
  | OrganizationDeployInProgress<any>
  | OrganizationDeployCompleted

export type DeployOrganizationStep<S extends InitialDeployOrganizationState> = (
  state: S,
) => Promise<StepResult>

const executeStep = async <S extends InitialDeployOrganizationState>(
  logger: TkmLogger,
  stepName: string,
  step: DeployOrganizationStep<S>,
  state: S,
): Promise<StepResult> => {
  logger.debug(`Begin step '${stepName}'`)
  const timer = state.totalTimer.startChild(stepName)
  try {
    return await step(state)
  } catch (error) {
    logger.error(`Unhandled error in step '${stepName}':`, error)
    return new OrganizationDeployCompleted({
      ...state,
      error,
      message: "Error",
      status: "FAILED",
      success: false,
    })
  } finally {
    timer.stop()
    logger.debug(
      `Step '${stepName}' completed in ${timer.getSecondsElapsed()}ms`,
    )
  }
}

export const executeSteps = async (
  state: InitialDeployOrganizationState,
): Promise<DeployOrganizationOutput> => {
  const { transitions, totalTimer, io } = state

  let result = await transitions.start(state)
  while (!result.completed) {
    result = await executeStep(io, result.stepName, result.step, result.state)
  }

  totalTimer.stop()

  return { ...result.props, timer: totalTimer }
}
