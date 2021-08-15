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

    const { result, message, error } = await executeHooks({
      ctx,
      stack,
      variables,
      logger,
      hooks: stack.hooks,
      operation: toHookOperation(operationType),
      stage: "after",
      status: toHookStatus(status),
    })

    if (result === "abort") {
      logger.error(`After deploy hooks failed with message: ${message}`)
      return transitions.failStackOperation({ ...state, message, error })
    }

    return transitions.completeStackOperation(state)
  }
