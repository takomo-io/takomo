import { StackOperationStep } from "../../common/steps"
import { UpdateStackHolder } from "../states"

/**
 * @hidden
 */
export const updateTerminationProtection: StackOperationStep<UpdateStackHolder> =
  async (state: UpdateStackHolder) => {
    const { stack, transitions, logger } = state

    await stack
      .getCloudFormationClient()
      .updateTerminationProtection(stack.name, stack.terminationProtection)

    logger.info("Termination protection updated")

    return transitions.initiateStackUpdate(state)
  }
