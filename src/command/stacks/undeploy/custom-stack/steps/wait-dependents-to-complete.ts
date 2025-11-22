import { StackOperationStep } from "../../../common/steps.js"
import { StackResult } from "../../../../command-model.js"
import { InitialUndeployCustomStackState } from "../states.js"

const hasSomeDependentFailed = (results: ReadonlyArray<StackResult>): boolean =>
  results.some((r) => !r.success)

const hasSomeDependentSkipped = (
  results: ReadonlyArray<StackResult>,
): boolean =>
  results.some((r) => r.status === "SKIPPED" && r.stackExistedBeforeOperation)

export const waitDependentsToComplete: StackOperationStep<
  InitialUndeployCustomStackState
> = async (state) => {
  const { transitions, dependents, currentState } = state

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

  if (!currentState) {
    return transitions.skipStackOperation({
      ...state,
      message: "Stack not found",
    })
  }

  return transitions.deleteStack(state)
}
