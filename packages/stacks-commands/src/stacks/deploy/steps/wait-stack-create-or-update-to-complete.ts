import { StackEvent } from "@takomo/aws-model"
import { StackOperationStep } from "../../common/steps"
import { resolveResultMessage } from "../common"
import { StackOperationClientTokenHolder } from "../states"

/**
 * @hidden
 */
export const waitStackCreateOrUpdateToComplete: StackOperationStep<StackOperationClientTokenHolder> = async (
  state,
) => {
  const { stack, clientToken, operationType, io, logger, transitions } = state

  const cloudFormationClient = stack.getCloudFormationClient()

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
  const message = resolveResultMessage(operationType, success)
  return transitions.executeAfterDeployHooks({
    ...state,
    message,
    status,
    events,
    success,
  })
}
