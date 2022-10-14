import R from "ramda"
import { StackOperationStep } from "../../common/steps"
import { resolveResultMessage } from "../common"
import { StackOperationClientTokenHolder } from "../states"

export const waitStackCreateOrUpdateToComplete: StackOperationStep<
  StackOperationClientTokenHolder
> = async (state) => {
  const { stack, clientToken, operationType, io, transitions, stackId } = state

  const eventListener = R.curry(io.printStackEvent)(stack.path)
  const timeout = operationType === "UPDATE" ? stack.timeout.update : 0

  const waitProps = {
    clientToken,
    stackId,
    eventListener,
    timeoutConfig: {
      timeout,
      startTime: Date.now(),
      timeoutOccurred: false,
    },
  }

  const client = await stack.getCloudFormationClient()
  const { stackStatus, events } = await client.waitStackDeployToComplete(
    waitProps,
  )

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
