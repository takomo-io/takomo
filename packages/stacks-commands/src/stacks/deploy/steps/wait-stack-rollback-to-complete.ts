import R from "ramda"
import { StackOperationStep } from "../../common/steps"
import { ContinueStackRollbackClientTokenHolder } from "../states"

/**
 * @hidden
 */
export const waitStackRollbackToComplete: StackOperationStep<ContinueStackRollbackClientTokenHolder> =
  async (state) => {
    const {
      transitions,
      stack,
      continueStackRollbackClientToken,
      io,
      currentStack,
    } = state

    const eventListener = R.curry(io.printStackEvent)(stack.path)

    const { events, stackStatus } = await stack
      .getCloudFormationClient()
      .waitStackRollbackToComplete({
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

    const updateStack = await stack
      .getCloudFormationClient()
      .getNotDeletedStack(stack.name)

    return transitions.enrichCurrentStack({
      ...state,
      currentStack: updateStack,
    })
  }
