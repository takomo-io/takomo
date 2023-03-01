import { HookOperation, HookStatus } from "../../../hooks/hook.js"
import { CommandStatus } from "../../../takomo-core/command.js"
import { StackOperationType } from "../../command-model.js"

export const toHookOperation = (
  operationType: StackOperationType,
): HookOperation => {
  switch (operationType) {
    case "CREATE":
    case "RECREATE":
      return "create"
    case "UPDATE":
      return "update"
    default:
      throw new Error(`Unsupported stack operation type: ${operationType}`)
  }
}

export const toHookStatus = (commandStatus: CommandStatus): HookStatus => {
  switch (commandStatus) {
    case "CANCELLED":
      return "cancelled"
    case "SKIPPED":
      return "skipped"
    case "SUCCESS":
      return "success"
    case "FAILED":
      return "failed"
    default:
      throw new Error(`Unsupported command status: ${commandStatus}`)
  }
}
