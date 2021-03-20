import { executeHooks } from "@takomo/stacks-hooks"
import { StackOperationStep } from "../../common/steps"
import { StackOperationResultHolder } from "../states"

/**
 * @hidden
 */
export const executeAfterUndeployHooks: StackOperationStep<StackOperationResultHolder> = async (
  state,
) => {
  const { stack, ctx, variables, logger, transitions, events } = state

  const { success, message, error } = await executeHooks(
    ctx,
    stack,
    variables,
    stack.hooks,
    "delete",
    "after",
    logger,
  )

  if (!success) {
    logger.error(`After undeploy hooks failed with message: ${message}`)
    return transitions.failStackOperation({ ...state, message, events, error })
  }

  return transitions.completeStackOperation(state)
}
