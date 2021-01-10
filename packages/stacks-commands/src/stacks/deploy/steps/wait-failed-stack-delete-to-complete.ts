import { StackEvent } from "@takomo/aws-model"
import { StackOperationStep } from "../../common/steps"
import { DeleteFailedStackClientTokenHolder } from "../states"

/**
 * @hidden
 */
export const waitFailedStackDeleteToComplete: StackOperationStep<DeleteFailedStackClientTokenHolder> = async (
  state,
) => {
  const {
    transitions,
    stack,
    deleteFailedStackClientToken,
    io,
    currentStack,
  } = state

  const {
    events,
    stackStatus,
  } = await stack
    .getCloudFormationClient()
    .waitUntilStackIsDeleted(
      currentStack.name,
      currentStack.id,
      deleteFailedStackClientToken,
      (e: StackEvent) => io.printStackEvent(stack.path, e),
    )

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
