import { executeHooks } from "../../../../takomo-stacks-hooks"
import { StackOperationStep } from "../../common/steps"
import { StackOperationResultHolder } from "../states"

export const executeAfterUndeployHooks: StackOperationStep<
  StackOperationResultHolder
> = async (state) => {
  const { stack, ctx, variables, logger, transitions, events } = state

  const { result, message, error } = await executeHooks({
    ctx,
    stack,
    variables,
    logger,
    hooks: stack.hooks,
    operation: "delete",
    stage: "after",
  })

  if (result === "abort") {
    logger.error(`After undeploy hooks failed with message: ${message}`)
    return transitions.failStackOperation({
      ...state,
      message,
      events,
      error,
    })
  }

  return transitions.completeStackOperation(state)
}
