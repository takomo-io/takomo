import { validateStackCredentialManagersWithAllowedAccountIds } from "@takomo/stacks-context"
import { TakomoError } from "@takomo/util"
import { CloudFormation } from "aws-sdk"
import { StacksUndeployPlan, StackUndeployOperation } from "./plan"

/**
 * @hidden
 */
export const isStackReadyForUndeploy = (
  stackStatus: CloudFormation.StackStatus,
): boolean =>
  [
    "ROLLBACK_COMPLETE",
    "CREATE_FAILED",
    "DELETE_FAILED",
    "CREATE_COMPLETE",
    "ROLLBACK_FAILED",
    "UPDATE_COMPLETE",
    "UPDATE_ROLLBACK_COMPLETE",
    "REVIEW_IN_PROGRESS",
    "IMPORT_ROLLBACK_FAILED",
    "IMPORT_COMPLETE",
    "IMPORT_ROLLBACK_COMPLETE",
  ].includes(stackStatus)

const validateStackStatus = (
  operations: ReadonlyArray<StackUndeployOperation>,
): void => {
  const stacksInInvalidStatus = []
  for (const operation of operations) {
    const { currentStack } = operation
    if (currentStack && !isStackReadyForUndeploy(currentStack.status)) {
      stacksInInvalidStatus.push(operation)
    }
  }

  if (stacksInInvalidStatus.length > 0) {
    throw new TakomoError(
      "Can't undeploy stacks because following stacks are in invalid status:\n\n" +
        stacksInInvalidStatus
          .map(
            (s) =>
              `  - ${s.stack.path} in invalid status: ${s.currentStack?.status}`,
          )
          .join("\n"),
    )
  }
}

const validateTerminationProtection = (
  operations: ReadonlyArray<StackUndeployOperation>,
): void => {
  const stacks = []
  for (const operation of operations) {
    const { currentStack } = operation
    if (currentStack && currentStack.enableTerminationProtection) {
      stacks.push(operation)
    }
  }

  if (stacks.length > 0) {
    throw new TakomoError(
      "Can't undeploy stacks because following stacks have termination protection enabled:\n\n" +
        stacks.map((s) => `  - ${s.stack.path}`).join("\n"),
    )
  }
}

/**
 * @hidden
 */
export const validateStacksUndeployPlan = async (
  plan: StacksUndeployPlan,
): Promise<void> => {
  const operations = plan.operations.filter((o) => o.type === "DELETE")
  await validateStackCredentialManagersWithAllowedAccountIds(
    operations.map((o) => o.stack),
  )
  validateStackStatus(operations)
  validateTerminationProtection(operations)
}
