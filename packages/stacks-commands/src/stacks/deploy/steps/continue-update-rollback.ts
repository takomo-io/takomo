import { StackOperationStep } from "../../common/steps"
import { CurrentStackHolder } from "../states"

/**
 * @hidden
 */
export const continueUpdateRollback: StackOperationStep<CurrentStackHolder> =
  async (state) => {
    const { transitions, stack, currentStack } = state

    const continueStackRollbackClientToken = await stack
      .getCloudFormationClient()
      .continueUpdateRollback(stack.name)

    return transitions.waitStackRollbackToComplete({
      ...state,
      continueStackRollbackClientToken,
      currentStack,
    })
  }
