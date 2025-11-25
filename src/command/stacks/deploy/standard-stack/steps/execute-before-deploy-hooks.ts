import { executeHooks } from "../../../../../hooks/execute.js"
import { toHookOperation } from "../../../common/hooks.js"
import { StackOperationStep } from "../../../common/steps.js"
import { DetailedCurrentStackHolder } from "../states.js"

export const executeBeforeDeployHooks: StackOperationStep<
  DetailedCurrentStackHolder
> = async (state) => {
  const {
    stack,
    operationType,
    ctx,
    variables,
    logger,
    transitions,
    currentStack,
    skipHooks,
  } = state

  if (skipHooks) {
    logger.info("Skip executing before deploy hooks")
    return transitions.prepareParameters(state)
  }

  const { result, message, error } = await executeHooks({
    ctx,
    stack,
    variables,
    hooks: stack.hooks,
    operation: toHookOperation(operationType),
    stage: "before",
    logger,
    currentStack,
  })

  if (result === "abort") {
    logger.error(`Before deploy hooks failed with message: ${message}`)
    return transitions.failStackOperation({
      ...state,
      message,
      error,
      events: [],
    })
  }

  if (result === "skip") {
    logger.info(
      `Before deploy hooks returned 'skip' result with message: ${message}`,
    )
    return transitions.skipStackOperation({
      ...state,
      message,
    })
  }

  return transitions.prepareParameters(state)
}
