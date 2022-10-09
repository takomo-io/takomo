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
import { TkmLogger, toCompactJson } from "../../takomo-util"
import { ClientListener } from "./client"

const apiRequestListenerMiddleware =
  (logger: TkmLogger, clientId: string, listener: ClientListener) =>
  <Output extends MetadataBearer = MetadataBearer>(
    next: InitializeHandler<any, Output>,
    context: HandlerExecutionContext,
  ): InitializeHandler<any, Output> =>
  async (
    args: InitializeHandlerArguments<any>,
  ): Promise<InitializeHandlerOutput<Output>> => {
    const {
      clientName,
      commandName,
      inputFilterSensitiveLog,
      outputFilterSensitiveLog,
    } = context

    const start = process.hrtime.bigint()
    const response = await next(args)
    const end = process.hrtime.bigint()
    const total = end - start

    const { $metadata, ...outputWithoutMetadata } = response.output

    if (logger.logLevel === "trace") {
      logger.trace(
        toCompactJson({
          clientName,
          commandName,
          input: inputFilterSensitiveLog(args.input),
          output: outputFilterSensitiveLog(outputWithoutMetadata),
          metadata: $metadata,
        }),
      )
    }

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
  logger: TkmLogger,
  clientId: string,
  listener: ClientListener,
): Pluggable<any, any> => ({
  applyToStack: (clientStack) => {
    clientStack.add(
      apiRequestListenerMiddleware(logger, clientId, listener),
      apiRequestListenerMiddlewareOptions,
    )
  },
})
