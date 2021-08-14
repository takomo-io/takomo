import { executeHooks } from "@takomo/stacks-hooks"
import { toHookOperation } from "../../common/hooks"
import { StackOperationStep } from "../../common/steps"
import { DetailedCurrentStackHolder } from "../states"

/**
 * @hidden
 */
export const executeBeforeDeployHooks: StackOperationStep<DetailedCurrentStackHolder> =
  async (state) => {
    const { stack, operationType, ctx, variables, logger, transitions } = state

    const { result, message, error } = await executeHooks({
      ctx,
      stack,
      variables,
      hooks: stack.hooks,
      operation: toHookOperation(operationType),
      stage: "before",
      logger,
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
