import R from "ramda"
import { StackOperationStep } from "../../common/steps"
import { ClientTokenHolder } from "../states"

/**
 * @hidden
 */
export const waitStackDeleteToComplete: StackOperationStep<ClientTokenHolder> =
  async (state) => {
    const { transitions, stack, currentStack, clientToken, io } = state

    const eventListener = R.curry(io.printStackEvent)(stack.path)

    const { events, stackStatus } = await stack
      .getCloudFormationClient()
      .waitStackDeleteToComplete({
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
