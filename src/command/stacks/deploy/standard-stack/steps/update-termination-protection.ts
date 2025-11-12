import { StackOperationStep } from "../../../common/steps.js"
import { UpdateStackHolder } from "../states.js"

export const updateTerminationProtection: StackOperationStep<
  UpdateStackHolder
> = async (state: UpdateStackHolder) => {
  const { stack, transitions, logger } = state

  const client = await stack.getCloudFormationClient()
  await client.updateTerminationProtection(
    stack.name,
    stack.terminationProtection,
  )

  logger.info("Termination protection updated")

  return transitions.initiateStackUpdate(state)
}
