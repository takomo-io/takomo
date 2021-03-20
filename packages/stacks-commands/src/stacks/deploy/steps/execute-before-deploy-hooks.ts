import { executeHooks } from "@takomo/stacks-hooks"
import { toHookOperation } from "../../common/hooks"
import { StackOperationStep } from "../../common/steps"
import { DetailedCurrentStackHolder } from "../states"

/**
 * @hidden
 */
export const executeBeforeDeployHooks: StackOperationStep<DetailedCurrentStackHolder> = async (
  state,
) => {
  const { stack, operationType, ctx, variables, logger, transitions } = state

  const { success, message, error } = await executeHooks(
    ctx,
    stack,
    variables,
    stack.hooks,
    toHookOperation(operationType),
    "before",
    logger,
  )

  if (!success) {
    logger.error(`Before deploy hooks failed with message: ${message}`)
    return transitions.failStackOperation({
      ...state,
      message,
      error,
      events: [],
    })
  }

  return transitions.prepareParameters(state)
}
