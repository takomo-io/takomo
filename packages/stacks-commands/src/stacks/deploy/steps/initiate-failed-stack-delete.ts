import { uuid } from "@takomo/util"
import { StackOperationStep } from "../../common/steps"
import { CurrentStackHolder } from "../states"

/**
 * @hidden
 */
export const initiateFailedStackDelete: StackOperationStep<CurrentStackHolder> =
  async (state) => {
    const { transitions, stack, currentStack } = state

    const client = stack.getCloudFormationClient()
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
