import { StackOperationStep } from "../../common/steps"
import { CurrentStackHolder } from "../states"

/**
 * @hidden
 */
export const enrichCurrentStack: StackOperationStep<CurrentStackHolder> =
  async (state) => {
    const { stack, transitions, currentStack } = state

    const detailedStack = await stack
      .getCloudFormationClient()
      .enrichStack(currentStack)

    return transitions.executeBeforeDeployHooks({
      ...state,
      currentStack: detailedStack,
    })
  }
