import { uuid } from "@takomo/util"
import { StackOperationStep } from "../../common/steps"
import { CurrentStackHolder } from "../states"

/**
 * @hidden
 */
export const initiateStackDeletion: StackOperationStep<CurrentStackHolder> = async (
  state,
) => {
  const { transitions, stack, currentStack } = state

  const clientToken = uuid()

  await stack.getCloudFormationClient().initiateStackDeletion({
    StackName: currentStack.id,
    ClientRequestToken: clientToken,
  })

  return transitions.waitStackDeleteToComplete({
    ...state,
    clientToken,
  })
}
