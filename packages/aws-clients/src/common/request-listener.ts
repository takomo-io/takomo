/**
 * @hidden
 */
import {
  AbsoluteLocation,
  HandlerExecutionContext,
  InitializeHandler,
  InitializeHandlerArguments,
  InitializeHandlerOptions,
  InitializeHandlerOutput,
  MetadataBearer,
  Pluggable,
} from "@aws-sdk/types"
import { ClientListener } from "./client"

const apiRequestListenerMiddleware =
  (clientId: string, listener: ClientListener) =>
  <Output extends MetadataBearer = MetadataBearer>(
    next: InitializeHandler<any, Output>,
    context: HandlerExecutionContext,
  ): InitializeHandler<any, Output> =>
  async (
    args: InitializeHandlerArguments<any>,
  ): Promise<InitializeHandlerOutput<Output>> => {
    const { clientName, commandName } = context

    const start = process.hrtime.bigint()
    const response = await next(args)
    const end = process.hrtime.bigint()
    const total = end - start

    const { $metadata } = response.output

    listener.onApiCall({
      clientId,
      start: Number(start / BigInt(1000000)),
      end: Number(end / BigInt(1000000)),
      time: Number(total / BigInt(1000000)),
      retries: ($metadata.attempts ?? 1) - 1,
      api: clientName,
      action: commandName,
    })

    return response
  }

/**
 * @hidden
 */
const apiRequestListenerMiddlewareOptions: InitializeHandlerOptions &
  AbsoluteLocation = {
  name: "apiRequestListener",
  tags: ["API_REQUEST_LISTENER"],
  step: "initialize",
  priority: "low",
}

/**
 * @hidden
 */
export const createApiRequestListenerPlugin = (
  clientId: string,
  listener: ClientListener,
): Pluggable<any, any> => ({
  applyToStack: (clientStack) => {
    clientStack.add(
      apiRequestListenerMiddleware(clientId, listener),
      apiRequestListenerMiddlewareOptions,
    )
  },
})
