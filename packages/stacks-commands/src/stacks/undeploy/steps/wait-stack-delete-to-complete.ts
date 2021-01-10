import { StackEvent } from "@takomo/aws-model"
import { StackOperationStep } from "../../common/steps"
import { ClientTokenHolder } from "../states"

/**
 * @hidden
 */
export const waitStackDeleteToComplete: StackOperationStep<ClientTokenHolder> = async (
  state,
) => {
  const { transitions, stack, currentStack, clientToken, io } = state

  const {
    events,
    stackStatus,
  } = await stack
    .getCloudFormationClient()
    .waitUntilStackIsDeleted(
      currentStack.name,
      currentStack.id,
      clientToken,
      (e: StackEvent) => io.printStackEvent(stack.path, e),
    )

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
