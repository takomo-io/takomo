import { CloudFormationStack } from "../../../../aws/cloudformation/model"
import { InternalStack } from "../../../../stacks/stack"
import { StackOperationStep } from "../../common/steps"
import { TemplateSummaryHolder } from "../states"

const hasTerminationProtectionChanged = (
  stack: InternalStack,
  currentStack: CloudFormationStack,
): boolean =>
  stack.terminationProtection !== currentStack.enableTerminationProtection

export const initiateStackCreateOrUpdate: StackOperationStep<
  TemplateSummaryHolder
> = (state) => {
  const { operationType, transitions, stack, currentStack } = state
  switch (operationType) {
    case "CREATE":
    case "RECREATE":
      return transitions.initiateStackCreate(state)
    case "UPDATE":
      if (currentStack === undefined) {
        throw new Error("Expected current stack to be defined")
      }

      const terminationProtectionUpdated = hasTerminationProtectionChanged(
        stack,
        currentStack,
      )

      if (terminationProtectionUpdated) {
        return transitions.updateTerminationProtection({
          ...state,
          currentStack,
          terminationProtectionUpdated,
        })
      }

      return transitions.initiateStackUpdate({
        ...state,
        currentStack,
        terminationProtectionUpdated,
      })
    default:
      throw new Error(`Unknown stack operation type: '${operationType}'`)
  }
}
