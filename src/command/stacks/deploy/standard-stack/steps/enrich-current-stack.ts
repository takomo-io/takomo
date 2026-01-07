import { StackOperationStep } from "../../../common/steps.js"
import { CurrentStackHolder } from "../states.js"

export const enrichCurrentStack: StackOperationStep<
  CurrentStackHolder
> = async (state) => {
  const { stack, transitions, currentStack } = state

  const client = await stack.getCloudFormationClient()
  const detailedStack = await client.enrichStackSummary(currentStack)

  return transitions.executeBeforeDeployHooks({
    ...state,
    currentStack: detailedStack,
  })
}
