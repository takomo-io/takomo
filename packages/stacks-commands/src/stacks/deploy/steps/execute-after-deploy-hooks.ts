import { executeHooks } from "@takomo/stacks-hooks"
import { toHookOperation, toHookStatus } from "../../common/hooks"
import { StackOperationStep } from "../../common/steps"
import { StackOperationResultHolder } from "../states"

/**
 * @hidden
 */
export const executeAfterDeployHooks: StackOperationStep<StackOperationResultHolder> = async (
  state,
) => {
  const {
    stack,
    operationType,
    status,
    ctx,
    variables,
    logger,
    transitions,
    events,
  } = state

  const { success, message } = await executeHooks(
    ctx,
    variables,
    stack.hooks,
    toHookOperation(operationType),
    "after",
    logger,
    toHookStatus(status),
  )

  if (!success) {
    logger.error(`After launch hooks failed with message: ${message}`)
    return transitions.failStackOperation({ ...state, message, events })
  }

  return transitions.completeStackOperation(state)
}
