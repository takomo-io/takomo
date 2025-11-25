import {
  ResourceStatus,
  StackDriftStatus,
  StackEvent,
  StackStatus,
} from "../aws/cloudformation/model.js"
import { CustomStackStatus } from "../stacks/custom-stack.js"
import { CommandStatus } from "../takomo-core/command.js"
import { cyan, green, grey, red, yellow } from "../utils/colors.js"
import { exhaustiveCheck } from "../utils/exhaustive-check.js"

export const formatCommandStatus = (status: CommandStatus): string => {
  switch (status) {
    case "CANCELLED":
      return grey(status)
    case "FAILED":
      return red(status)
    case "SKIPPED":
      return grey(status)
    case "SUCCESS":
      return green(status)
    default:
      return status
  }
}

export const formatResourceStatus = (status: ResourceStatus): string => {
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

export const formatCustomStackStatus = (status: CustomStackStatus): string => {
  switch (status) {
    case "CREATE_COMPLETED":
    case "UPDATE_COMPLETED":
      return green(status)
    case "PENDING":
      return cyan(status)
    default:
      return exhaustiveCheck(status)
  }
}

export const formatStandardStackStatus = (status?: StackStatus): string => {
  if (!status) {
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

export const formatDriftStatus = (status?: StackDriftStatus): string => {
  if (!status) {
    return grey("NOT_CHECKED")
  }

  switch (status) {
    case "DRIFTED":
      return red(status)
    case "IN_SYNC":
      return green(status)
    default:
      return grey(status)
  }
}

export const formatStackEvent = (e: StackEvent): string =>
  [
    e.stackName,
    e.logicalResourceId,
    e.resourceType,
    formatResourceStatus(e.resourceStatus),
    e.resourceStatusReason,
  ].join(" ")
