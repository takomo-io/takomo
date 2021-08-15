import R from "ramda"
import { StackOperationStep } from "../../common/steps"
import { DeleteFailedStackClientTokenHolder } from "../states"

/**
 * @hidden
 */
export const waitFailedStackDeleteToComplete: StackOperationStep<DeleteFailedStackClientTokenHolder> =
  async (state) => {
    const {
      transitions,
      stack,
      deleteFailedStackClientToken,
      io,
      currentStack,
    } = state

    const eventListener = R.curry(io.printStackEvent)(stack.path)

    const { events, stackStatus } = await stack
      .getCloudFormationClient()
      .waitStackDeleteToComplete({
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
