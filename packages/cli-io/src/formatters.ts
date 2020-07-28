import { CommandStatus } from "@takomo/core"
import { cyan, green, grey, orange, red, yellow } from "@takomo/util"
import { CloudFormation } from "aws-sdk"
import { StackStatus } from "aws-sdk/clients/cloudformation"
import { AccountStatus } from "aws-sdk/clients/organizations"

export const formatCommandStatus = (status: CommandStatus): string => {
  switch (status) {
    case CommandStatus.CANCELLED:
      return grey(status)
    case CommandStatus.FAILED:
      return red(status)
    case CommandStatus.SKIPPED:
      return grey(status)
    case CommandStatus.SUCCESS:
      return green(status)
    default:
      return status
  }
}

export const formatResourceStatus = (
  status: CloudFormation.ResourceStatus,
): string => {
  if (status.endsWith("COMPLETE")) {
    return green(status)
  }

  if (status.endsWith("IN_PROGRESS")) {
    return yellow(status)
  }

  if (status.endsWith("FAILED")) {
    return red(status)
  }

  if (status.endsWith("SKIPPED")) {
    return grey(status)
  }

  return status
}

export const formatStackStatus = (status: StackStatus | null): string => {
  if (status === null) {
    return cyan("PENDING")
  }

  switch (status) {
    case "CREATE_IN_PROGRESS":
    case "DELETE_IN_PROGRESS":
    case "UPDATE_IN_PROGRESS":
    case "UPDATE_COMPLETE_CLEANUP_IN_PROGRESS":
    case "REVIEW_IN_PROGRESS":
    case "IMPORT_IN_PROGRESS":
      return yellow(status)
    case "CREATE_FAILED":
    case "ROLLBACK_IN_PROGRESS":
    case "ROLLBACK_FAILED":
    case "ROLLBACK_COMPLETE":
    case "DELETE_FAILED":
    case "UPDATE_ROLLBACK_IN_PROGRESS":
    case "UPDATE_ROLLBACK_FAILED":
    case "UPDATE_ROLLBACK_COMPLETE_CLEANUP_IN_PROGRESS":
    case "UPDATE_ROLLBACK_COMPLETE":
    case "IMPORT_ROLLBACK_IN_PROGRESS":
    case "IMPORT_ROLLBACK_FAILED":
    case "IMPORT_ROLLBACK_COMPLETE":
      return red(status)
    case "CREATE_COMPLETE":
    case "DELETE_COMPLETE":
    case "UPDATE_COMPLETE":
    case "IMPORT_COMPLETE":
      return green(status)
    default:
      return status
  }
}

export const formatStackEvent = (e: CloudFormation.StackEvent): string =>
  [
    e.StackName,
    e.LogicalResourceId,
    e.ResourceType,
    formatResourceStatus(e.ResourceStatus!),
    e.ResourceStatusReason,
  ].join(" ")

export const formatResourceChange = (
  action: CloudFormation.ChangeAction,
  replacement: CloudFormation.Replacement,
  resourceLogicalId: string,
): string => {
  switch (action) {
    case "Add":
      return green(`  + ${resourceLogicalId}:`)
    case "Modify":
      if (replacement === "True") {
        return orange(`  ± ${resourceLogicalId}:       (new resource required)`)
      } else if (replacement === "Conditional") {
        return orange(
          `  ± ${resourceLogicalId}:       (new resource required conditionally)`,
        )
      } else {
        return yellow(`  ~ ${resourceLogicalId}:`)
      }
    case "Remove":
      return red(`  - ${resourceLogicalId}:`)
    default:
      throw new Error(`Unsupported change action: ${action}`)
  }
}

export const formatAccountStatus = (status: AccountStatus): string => {
  switch (status) {
    case "ACTIVE":
      return green(status)
    case "SUSPENDED":
      return grey(status)
    default:
      throw new Error(`Unsupported account status state: ${status}`)
  }
}
