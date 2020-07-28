import {
  CommandContext,
  HookExecutor,
  HookOperation,
  HooksExecutionOutput,
  HookStage,
  HookStatus,
  StackOperationVariables,
} from "@takomo/stacks-model"
import { Logger } from "@takomo/util"

export const executeHooks = async (
  ctx: CommandContext,
  variables: StackOperationVariables,
  hooks: HookExecutor[],
  operation: HookOperation,
  stage: HookStage,
  logger: Logger,
  status: HookStatus | null = null,
): Promise<HooksExecutionOutput> => {
  logger.debug(
    `About to execute hooks (operation: ${operation}, stage: ${stage}, status: ${status})`,
  )

  const input = {
    ctx,
    variables,
    stage,
    operation,
    status,
  }

  const hooksToExecute = hooks.filter((h) => h.match(input))

  logger.debug(`Found ${hooksToExecute.length} matching hook(s)`)

  for (const hook of hooksToExecute) {
    logger.debug(
      `Execute hook (name: ${hook.config.name}, type: ${hook.config.type})`,
    )

    try {
      const output = await hook.execute(input)

      logger.debug(
        `Hook (name: ${hook.config.name}, type: ${hook.config.type}) executed with success: ${output.success}, message: ${output.message}`,
      )

      variables.hooks[hook.config.name] = output.value

      if (!output.success) {
        return {
          message: output.message || "Failed",
          success: false,
        }
      }
    } catch (e) {
      logger.error(
        `An error occurred while executing hook (name: ${hook.config.name}, type: ${hook.config.type})`,
        e,
      )
      return {
        message: e.message || "Error",
        success: false,
      }
    }
  }

  return {
    message: "Success",
    success: true,
  }
}
