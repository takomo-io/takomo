import { StackOperationType } from "@takomo/stacks-model"

export const resolveResultMessage = (
  operationType: StackOperationType,
  success: boolean,
): string => {
  if (operationType === "UPDATE" && success) return "Stack update succeeded"
  else if (operationType === "UPDATE" && !success) return "Stack update failed"
  else if (operationType === "CREATE" && success)
    return "Stack create succeeded"
  else if (operationType === "RECREATE" && success)
    return "Stack create succeeded"
  else if (operationType === "CREATE" && !success) return "Stack create failed"
  else if (operationType === "RECREATE" && !success)
    return "Stack create failed"
  else
    throw new Error(
      `Unsupported combination of stack operation type ${operationType} and success value ${success}`,
    )
}
