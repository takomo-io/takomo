import { uuid } from "../../../../../utils/strings.js"
import { StackOperationStep } from "../../../common/steps.js"
import { CurrentStackHolder } from "../states.js"

export const initiateStackDeletion: StackOperationStep<
  CurrentStackHolder
> = async (state) => {
  const { transitions, stack, currentStack } = state

  const clientToken = uuid()

  const client = await stack.getCloudFormationClient()
  await client.initiateStackDeletion({
    StackName: currentStack.id,
    ClientRequestToken: clientToken,
  })

  return transitions.waitStackDeleteToComplete({
    ...state,
    clientToken,
  })
}
