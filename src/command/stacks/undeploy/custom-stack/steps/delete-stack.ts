import { StackOperationStep } from "../../../common/steps.js"
import { InitialUndeployCustomStackState } from "../../standard-stack/states.js"

export const deleteStack: StackOperationStep<
  InitialUndeployCustomStackState
> = async (state) => {
  const { transitions, stack, currentStack } = state

  // TODO: Execute deletion and handle errors

  return transitions.completeStackOperation({
    ...state,
    events: [], // TODO: Should we get events somehow?
    status: "SUCCESS",
    message: "Stack delete succeeded",
    success: true,
  })
}
