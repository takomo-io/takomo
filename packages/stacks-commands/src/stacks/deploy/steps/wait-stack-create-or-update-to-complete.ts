import { StackEvent } from "@takomo/aws-model"
import { StackOperationStep } from "../../common/steps"
import { StackOperationClientTokenHolder } from "../states"

/**
 * @hidden
 */
export const waitStackCreateOrUpdateToComplete: StackOperationStep<StackOperationClientTokenHolder> = async (
  state,
) => {
  const { stack, clientToken, operationType, io, logger, transitions } = state

  const cloudFormationClient = stack.getCloudFormationClient()

  const resolveMessage = (success: boolean): string => {
    if (operationType === "UPDATE" && success) return "Stack update succeeded"
    else if (operationType === "UPDATE" && !success)
      return "Stack update failed"
    else if (operationType === "CREATE" && success)
      return "Stack create succeeded"
    else if (operationType === "RECREATE" && success)
      return "Stack create succeeded"
    else if (operationType === "CREATE" && !success)
      return "Stack create failed"
    else if (operationType === "RECREATE" && !success)
      return "Stack create failed"
    else
      throw new Error(
        `Unsupported combination of stack operation type ${operationType} and success value ${success}`,
      )
  }

  const timeout = operationType === "UPDATE" ? stack.timeout.update : 0

  const {
    stackStatus,
    events,
  } = await cloudFormationClient.waitUntilStackCreateOrUpdateCompletes(
    stack.name,
    clientToken,
    (e: StackEvent) => io.printStackEvent(stack.path, e),
    {
      timeout,
      startTime: Date.now(),
      timeoutOccurred: false,
    },
  )

  logger.info(`Stack deploy completed with status: ${stackStatus}`)

  const success =
    stackStatus === "UPDATE_COMPLETE" || stackStatus === "CREATE_COMPLETE"
  const status = success ? "SUCCESS" : "FAILED"
  const message = resolveMessage(success)
  return transitions.executeAfterDeployHooks({
    ...state,
    message,
    status,
    events,
    success,
  })
}
