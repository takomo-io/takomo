import * as R from "ramda"
import { StackStatus } from "../../../aws/cloudformation/model.js"
import { validateStackCredentialManagersWithAllowedAccountIds } from "../../../takomo-stacks-context/common.js"
import { TakomoError } from "../../../utils/errors.js"
import { StackDeployOperation, StacksDeployPlan } from "./plan.js"

export const isStackReadyForDeploy = (stackStatus: StackStatus): boolean =>
  [
    "CREATE_COMPLETE",
    "UPDATE_COMPLETE",
    "UPDATE_ROLLBACK_COMPLETE",
    "UPDATE_ROLLBACK_FAILED",
    "REVIEW_IN_PROGRESS",
    "CREATE_FAILED",
    "ROLLBACK_COMPLETE",
    "ROLLBACK_FAILED",
    "IMPORT_COMPLETE",
    "IMPORT_ROLLBACK_COMPLETE",
  ].includes(stackStatus)

export const validateStacksStatus = (
  operations: ReadonlyArray<StackDeployOperation>,
): void => {
  const stacksInInvalidStatus = []
  for (const operation of operations) {
    const { currentStack } = operation
    if (currentStack && !isStackReadyForDeploy(currentStack.status)) {
      stacksInInvalidStatus.push(operation)
    }
  }

  if (stacksInInvalidStatus.length > 0) {
    throw new TakomoError(
      "Can't deploy stacks because following stacks are in invalid status:\n\n" +
        stacksInInvalidStatus
          .map(
            (s) =>
              `  - ${s.stack.path} in invalid status: ${s.currentStack?.status}`,
          )
          .join("\n"),
    )
  }
}

const validateCredentialManagers = async (
  plan: StacksDeployPlan,
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

export const validateStacksDeployPlan = async (
  plan: StacksDeployPlan,
): Promise<void> => {
  const { operations } = plan

  await validateCredentialManagers(plan)

  await validateStackCredentialManagersWithAllowedAccountIds(
    operations.map((o) => o.stack),
  )

  validateStacksStatus(operations)
}
