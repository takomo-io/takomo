import { executeHooks } from "../../../../hooks/execute.js"
import { toHookOperation, toHookStatus } from "../../common/hooks.js"
import { StackOperationStep } from "../../common/steps.js"
import { StackOperationResultHolder } from "../states.js"

export const executeAfterDeployHooks: StackOperationStep<
  StackOperationResultHolder
> = async (state) => {
  const {
    stack,
    operationType,
    status,
    ctx,
    variables,
    logger,
    transitions,
    stackAfterOperation,
    skipHooks,
  } = state

  if (skipHooks) {
    logger.info("Skip executing after deploy hooks")
    return transitions.completeStackOperation(state)
  }

  const { result, message, error } = await executeHooks({
    ctx,
    stack,
    variables,
    logger,
    hooks: stack.hooks,
    operation: toHookOperation(operationType),
    stage: "after",
    status: toHookStatus(status),
    currentStack: stackAfterOperation,
  })

  if (result === "abort") {
    logger.error(`After deploy hooks failed with message: ${message}`)
    return transitions.failStackOperation({ ...state, message, error })
  }

  return transitions.completeStackOperation(state)
}
