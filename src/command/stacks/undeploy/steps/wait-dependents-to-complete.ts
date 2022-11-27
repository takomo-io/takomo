import { StackResult } from "../../../command-model"
import { StackOperationStep } from "../../common/steps"
import { InitialUndeployStackState } from "../states"

const hasSomeDependentFailed = (results: ReadonlyArray<StackResult>): boolean =>
  results.some((r) => !r.success)

const hasSomeDependentSkipped = (
  results: ReadonlyArray<StackResult>,
): boolean =>
  results.some((r) => r.status === "SKIPPED" && r.stackExistedBeforeOperation)

export const waitDependentsToComplete: StackOperationStep<
  InitialUndeployStackState
> = async (state) => {
  const { transitions, dependents, currentStack } = state

  const dependentResults = await Promise.all(dependents)

  if (hasSomeDependentFailed(dependentResults)) {
    return transitions.cancelStackOperation({
      ...state,
      message: "Dependents failed",
    })
  }

  if (hasSomeDependentSkipped(dependentResults)) {
    return transitions.cancelStackOperation({
      ...state,
      message: "Dependents skipped",
    })
  }

  if (!currentStack) {
    return transitions.skipStackOperation({
      ...state,
      message: "Stack not found",
    })
  }

  return transitions.executeBeforeUndeployHooks({
    ...state,
    currentStack,
  })
}
