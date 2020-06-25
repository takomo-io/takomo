import { CommandStatus } from "@takomo/core"
import { StackResult } from "@takomo/stacks-model"
import { TemplateSummaryHolder } from "./model"
import { prepareTags } from "./tags"

const getValueForLog = (
  value: any,
  confidential: boolean,
  logConfidentialInfo: boolean,
): any => {
  if (!confidential) {
    return value
  }
  return logConfidentialInfo ? value : "<concealed>"
}

export const prepareParameters = async (
  holder: TemplateSummaryHolder,
): Promise<StackResult> => {
  const { stack, ctx, io, watch, logger } = holder
  const logConfidentialInfo = ctx
    .getOptions()
    .isConfidentialInfoLoggingEnabled()

  const childWatch = watch.startChild("prepare-parameters")

  logger.debug("Prepare parameters")

  try {
    const parameters = await Promise.all(
      Array.from(stack.getParameters().entries()).map(
        async ([parameterName, executor]) => {
          const value = await executor.resolve({
            ctx,
            stack,
            parameterName,
            listParameterIndex: 0,
            logger: ctx.getLogger().childLogger(stack.getPath()),
          })

          const loggedValue = getValueForLog(
            value,
            executor.isConfidential(),
            logConfidentialInfo,
          )

          io.debugObject("Parameter:", {
            name: parameterName,
            value: loggedValue,
            resolver: executor.getName(),
            confidential: executor.isConfidential(),
          })

          const parameterValue = Array.isArray(value)
            ? value.map((v) => `${v}`).join(",")
            : `${value}`

          return {
            UsePreviousValue: false,
            ParameterKey: parameterName,
            ParameterValue: parameterValue,
          }
        },
      ),
    )

    childWatch.stop()
    return prepareTags({ ...holder, parameters })
  } catch (e) {
    logger.error("Failed to prepare parameters", e)
    return {
      stack,
      message: e.message,
      reason: "PREPARE_PARAMETERS_FAILED",
      status: CommandStatus.FAILED,
      events: [],
      success: false,
      watch: watch.stop(),
    }
  }
}
