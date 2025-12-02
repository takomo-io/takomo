import * as R from "ramda"
import { StackStatus } from "../../../aws/cloudformation/model.js"
import { validateStackCredentialManagersWithAllowedAccountIds } from "../../../takomo-stacks-context/common.js"
import { TakomoError } from "../../../utils/errors.js"
import {
  isCustomStackUndeployOperation,
  isStandardStackUndeployOperation,
  StacksUndeployPlan,
  StackUndeployOperation,
} from "./plan.js"

export const isStackReadyForUndeploy = (stackStatus: StackStatus): boolean =>
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
    if (isStandardStackUndeployOperation(operation)) {
      const { currentStack } = operation
      if (currentStack && !isStackReadyForUndeploy(currentStack.status)) {
        stacksInInvalidStatus.push(operation)
      }
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
    if (isStandardStackUndeployOperation(operation)) {
      const { currentStack } = operation
      if (currentStack && currentStack.enableTerminationProtection) {
        stacks.push(operation)
      }
    }

    if (isCustomStackUndeployOperation(operation)) {
      const { currentState, stack } = operation
      if (currentState.status !== "PENDING" && stack.terminationProtection) {
        stacks.push(operation)
      }
    }
  }

  if (stacks.length > 0) {
    throw new TakomoError(
      "Can't undeploy stacks because following stacks have termination protection enabled:\n\n" +
        stacks.map((s) => `  - ${s.stack.path}`).join("\n"),
    )
  }
}

const validateCredentialManagers = async (
  plan: StacksUndeployPlan,
): Promise<void> => {
  const credentialManagers = plan.operations.map(
    (operation) => operation.stack.credentialManager,
  )

  const uniqueCredentialManagers = R.uniqBy(
    (cm) => cm.iamRoleArn ?? "",
    credentialManagers,
  )

  await Promise.all(
    uniqueCredentialManagers.map((cm) => cm.getCallerIdentity()),
  )
}

export const validateStacksUndeployPlan = async (
  plan: StacksUndeployPlan,
): Promise<void> => {
  const operations = plan.operations.filter((o) => o.type === "DELETE")

  await validateCredentialManagers(plan)

  await validateStackCredentialManagersWithAllowedAccountIds(
    operations.map((o) => o.stack),
  )
  validateStackStatus(operations)
  validateTerminationProtection(operations)
}
