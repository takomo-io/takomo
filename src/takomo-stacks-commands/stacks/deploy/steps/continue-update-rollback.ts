import { StackOperationStep } from "../../common/steps"
import { CurrentStackHolder } from "../states"

export const continueUpdateRollback: StackOperationStep<
  CurrentStackHolder
> = async (state) => {
  const { transitions, stack, currentStack, logger } = state
  logger.info("Continue update rollback")

  const continueStackRollbackClientToken = await stack
    .getCloudFormationClient()
    .continueUpdateRollback(stack.name)

  return transitions.waitStackRollbackToComplete({
    ...state,
    continueStackRollbackClientToken,
    currentStack,
  })
}
