import { executeHooks } from "@takomo/stacks-hooks"
import { toHookOperation, toHookStatus } from "../../common/hooks"
import { StackOperationStep } from "../../common/steps"
import { StackOperationResultHolder } from "../states"

/**
 * @hidden
 */
export const executeAfterDeployHooks: StackOperationStep<StackOperationResultHolder> =
  async (state) => {
    const {
      stack,
      operationType,
      status,
      ctx,
      variables,
      logger,
      transitions,
    } = state

    const { success, message, error } = await executeHooks(
      ctx,
      stack,
      variables,
      stack.hooks,
      toHookOperation(operationType),
      "after",
      logger,
      toHookStatus(status),
    )

    if (!success) {
      logger.error(`After launch hooks failed with message: ${message}`)
      return transitions.failStackOperation({ ...state, message, error })
    }

    return transitions.completeStackOperation(state)
  }
