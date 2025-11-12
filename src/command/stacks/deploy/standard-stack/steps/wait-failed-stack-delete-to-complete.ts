import * as R from "ramda"
import { StackOperationStep } from "../../../common/steps.js"
import { DeleteFailedStackClientTokenHolder } from "../states.js"

export const waitFailedStackDeleteToComplete: StackOperationStep<
  DeleteFailedStackClientTokenHolder
> = async (state) => {
  const { transitions, stack, deleteFailedStackClientToken, io, currentStack } =
    state

  const eventListener = R.curry(io.printStackEvent)(stack.path)
  const client = await stack.getCloudFormationClient()
  const { events, stackStatus } = await client.waitStackDeleteToComplete({
    eventListener,
    stackId: currentStack.id,
    clientToken: deleteFailedStackClientToken,
  })

  if (stackStatus !== "DELETE_COMPLETE") {
    return transitions.failStackOperation({
      ...state,
      events,
      message: "Failed to delete previously failed stack",
    })
  }

  return transitions.executeBeforeDeployHooks({
    ...state,
    currentStack: undefined,
  })
}
