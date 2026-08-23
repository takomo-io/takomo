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
import { toCompactJson } from "../../utils/json.js"
import { TkmLogger } from "../../utils/logging.js"
import { redactConfidentialValue } from "../../utils/confidential.js"
import { ClientListener } from "./client.js"

export const apiRequestListenerMiddleware =
  (
    logger: TkmLogger,
    clientId: string,
    listener: ClientListener,
    confidentialValuesLoggingEnabled = false,
  ) =>
  <Input extends object, Output extends MetadataBearer = MetadataBearer>(
    next: InitializeHandler<Input, Output>,
    context: HandlerExecutionContext,
  ): InitializeHandler<Input, Output> =>
  async (
    args: InitializeHandlerArguments<Input>,
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
          input: redactConfidentialValue(
            inputFilterSensitiveLog(args.input),
            true,
            confidentialValuesLoggingEnabled,
          ),
          output: redactConfidentialValue(
            outputFilterSensitiveLog(outputWithoutMetadata),
            true,
            confidentialValuesLoggingEnabled,
          ),
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
      api: clientName!,
      action: commandName!,
    })

    return response
  }

export const apiRequestListenerMiddlewareOptions: InitializeHandlerOptions &
  AbsoluteLocation = {
  name: "apiRequestListener",
  tags: ["API_REQUEST_LISTENER"],
  step: "initialize",
  priority: "low",
}

export const createApiRequestListenerPlugin = <
  Input extends object = object,
  Output extends MetadataBearer = MetadataBearer,
>(
  logger: TkmLogger,
  clientId: string,
  listener: ClientListener,
  confidentialValuesLoggingEnabled = false,
): Pluggable<Input, Output> => ({
  applyToStack: (clientStack) => {
    clientStack.add(
      apiRequestListenerMiddleware(
        logger,
        clientId,
        listener,
        confidentialValuesLoggingEnabled,
      ),
      apiRequestListenerMiddlewareOptions,
    )
  },
})
