import { StackOperationStep } from "../../../common/steps.js"
import { InitialUndeployCustomStackState } from "../states.js"

export const deleteStack: StackOperationStep<
  InitialUndeployCustomStackState
> = async (state) => {
  const { transitions, customStackHandler, stack, currentStack } = state

  // TODO: handle errors

  const result = await customStackHandler.delete({
    config: stack.customConfig,
    logger: state.logger,
    state: currentStack,
  })

  return transitions.completeStackOperation({
    ...state,
    events: [], // TODO: Should we get events somehow?
    status: "SUCCESS",
    message: "Stack delete succeeded",
    success: true,
  })
}
