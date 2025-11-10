import * as R from "ramda"
import { StackOperationStep } from "../../../common/steps.js"
import { ClientTokenHolder } from "../states.js"

export const waitStackDeleteToComplete: StackOperationStep<
  ClientTokenHolder
> = async (state) => {
  const { transitions, stack, currentStack, clientToken, io } = state

  const eventListener = R.curry(io.printStackEvent)(stack.path)

  const client = await stack.getCloudFormationClient()

  const { events, stackStatus } = await client.waitStackDeleteToComplete({
    clientToken,
    eventListener,
    stackId: currentStack.id,
  })

  if (stackStatus !== "DELETE_COMPLETE") {
    return transitions.executeAfterUndeployHooks({
      ...state,
      events,
      status: "FAILED",
      message: "Stack delete failed",
      success: false,
    })
  }

  return transitions.executeAfterUndeployHooks({
    ...state,
    events,
    status: "SUCCESS",
    message: "Stack delete succeeded",
    success: true,
  })
}
