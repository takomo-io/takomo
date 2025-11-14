import { StackResult } from "../../../../command-model.js"
import { StackOperationStep } from "../../../common/steps.js"
import { InitialDeployCustomStackState } from "../states.js"

const hasSomeDependencyFailed = (
  dependencyResults: ReadonlyArray<StackResult>,
): boolean => dependencyResults.some((r) => !r.success)

const hasSomeDependencySkipped = (
  dependencyResults: ReadonlyArray<StackResult>,
): boolean =>
  dependencyResults.some(
    (r) => r.status === "SKIPPED" && !r.stackExistedBeforeOperation,
  )

export const waitDependenciesToComplete: StackOperationStep<
  InitialDeployCustomStackState
> = async (state) => {
  const { logger, dependencies, transitions, operationType, currentStack } =
    state

  logger.debug(`Wait ${dependencies.length} dependencies to complete`)
  const dependencyResults = await Promise.all(dependencies)

  if (hasSomeDependencyFailed(dependencyResults)) {
    logger.info("At least one dependency failed")
    return transitions.cancelStackOperation({
      ...state,
      message: "Dependencies failed",
    })
  }

  if (currentStack === undefined) {
    if (hasSomeDependencySkipped(dependencyResults)) {
      logger.info(
        "At least one dependency stacks creation was skipped, cancel stack creation",
      )
      return transitions.cancelStackOperation({
        ...state,
        message: "Dependencies skipped",
      })
    }
  }

  return transitions.prepareParameters({
    ...state,
    currentStack,
  })
}
