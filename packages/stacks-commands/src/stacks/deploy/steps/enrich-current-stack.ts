import { StackOperationStep } from "../../common/steps"
import { CurrentStackHolder } from "../states"

export const enrichCurrentStack: StackOperationStep<CurrentStackHolder> =
  async (state) => {
    const { stack, transitions, currentStack } = state

    const detailedStack = await stack
      .getCloudFormationClient()
      .enrichStackSummary(currentStack)

    return transitions.executeBeforeDeployHooks({
      ...state,
      currentStack: detailedStack,
    })
  }
