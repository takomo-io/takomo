import { StackResult } from "@takomo/stacks-model"
import { StackOperationStep } from "../../common/steps"
import { InitialDeployStackState } from "../states"

const hasSomeDependencyFailed = (
  dependencyResults: ReadonlyArray<StackResult>,
): boolean => dependencyResults.some((r) => !r.success)

const hasSomeDependencySkipped = (
  dependencyResults: ReadonlyArray<StackResult>,
): boolean =>
  dependencyResults.some(
    (r) => r.status === "SKIPPED" && !r.stackExistedBeforeOperation,
  )

/**
 * @hidden
 */
export const waitDependenciesToComplete: StackOperationStep<InitialDeployStackState> =
  async (state) => {
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

      return transitions.executeBeforeDeployHooks({
        ...state,
        currentStack,
      })
    }

    return operationType === "RECREATE"
      ? transitions.initiateFailedStackDelete({
          ...state,
          currentStack,
        })
      : transitions.enrichCurrentStack({
          ...state,
          currentStack,
        })
  }
