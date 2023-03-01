import { executeHooks } from "../../../../hooks/execute.js"
import { StackOperationStep } from "../../common/steps.js"
import { CurrentStackHolder } from "../states.js"

export const executeBeforeUndeployHooks: StackOperationStep<
  CurrentStackHolder
> = async (state) => {
  const { stack, ctx, variables, logger, transitions, currentStack } = state

  const { result, message, error } = await executeHooks({
    ctx,
    stack,
    variables,
    hooks: stack.hooks,
    operation: "delete",
    stage: "before",
    logger,
    currentStack,
  })

  if (result === "abort") {
    logger.error(`Before undeploy hooks failed with message: ${message}`)
    return transitions.failStackOperation({
      ...state,
      message,
      error,
      events: [],
    })
  }

  if (result === "skip") {
    logger.info(
      `Before undeploy hooks returned 'skip' result with message: ${message}`,
    )
    return transitions.skipStackOperation({
      ...state,
      message,
    })
  }

  return transitions.initiateStackDelete(state)
}
