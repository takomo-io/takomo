import { StackOperationStep } from "../../common/steps"
import { UpdateStackHolder } from "../states"

/**
 * @hidden
 */
export const updateTerminationProtection: StackOperationStep<UpdateStackHolder> = async (
  state: UpdateStackHolder,
) => {
  const { stack, transitions } = state

  await stack
    .getCloudFormationClient()
    .updateTerminationProtection(stack.name, stack.terminationProtection)

  return transitions.initiateStackUpdate(state)
}
