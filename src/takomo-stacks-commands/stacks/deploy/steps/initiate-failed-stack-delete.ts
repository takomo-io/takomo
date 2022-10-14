import { uuid } from "../../../../takomo-util"
import { StackOperationStep } from "../../common/steps"
import { CurrentStackHolder } from "../states"

export const initiateFailedStackDelete: StackOperationStep<
  CurrentStackHolder
> = async (state) => {
  const { transitions, stack, currentStack, logger } = state
  logger.info("Delete stack in failed state")

  const client = await stack.getCloudFormationClient()
  await client.updateTerminationProtection(stack.name, false)

  const deleteFailedStackClientToken = uuid()

  await client.initiateStackDeletion({
    StackName: stack.name,
    ClientRequestToken: deleteFailedStackClientToken,
  })

  return transitions.waitFailedStackDeleteToComplete({
    ...state,
    deleteFailedStackClientToken,
    currentStack,
  })
}
