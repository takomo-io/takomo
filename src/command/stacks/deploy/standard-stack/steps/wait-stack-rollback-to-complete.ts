import * as R from "ramda"
import { StackOperationStep } from "../../../common/steps.js"
import { ContinueStackRollbackClientTokenHolder } from "../states.js"

export const waitStackRollbackToComplete: StackOperationStep<
  ContinueStackRollbackClientTokenHolder
> = async (state) => {
  const {
    transitions,
    stack,
    continueStackRollbackClientToken,
    io,
    currentStack,
  } = state

  const eventListener = R.curry(io.printStackEvent)(stack.path)

  const client = await stack.getCloudFormationClient()
  const { events, stackStatus } = await client.waitStackRollbackToComplete({
    eventListener,
    stackId: currentStack.id,
    clientToken: continueStackRollbackClientToken,
  })

  if (stackStatus !== "UPDATE_ROLLBACK_COMPLETE") {
    return transitions.failStackOperation({
      ...state,
      events,
      message: "Stack rollback failed",
    })
  }

  const updateStack = await client.getNotDeletedStack(stack.name)

  return transitions.enrichCurrentStack({
    ...state,
    currentStack: updateStack,
  })
}
