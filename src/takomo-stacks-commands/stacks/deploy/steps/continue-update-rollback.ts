import { StackOperationStep } from "../../common/steps"
import { CurrentStackHolder } from "../states"

export const continueUpdateRollback: StackOperationStep<
  CurrentStackHolder
> = async (state) => {
  const { transitions, stack, currentStack, logger } = state
  logger.info("Continue update rollback")

  const client = await stack.getCloudFormationClient()
  const continueStackRollbackClientToken = await client.continueUpdateRollback(
    stack.name,
  )

  return transitions.waitStackRollbackToComplete({
    ...state,
    continueStackRollbackClientToken,
    currentStack,
  })
}
